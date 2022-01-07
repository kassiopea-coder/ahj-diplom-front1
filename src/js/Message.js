/* eslint-disable import/no-cycle */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-return */
/* eslint-disable no-useless-escape */
import Geolocation from './GeoLocation';
import api from './ApiConnector';
import pinMsg from './PinMessage';
import popup from './Popup';

// const messagesPin = document.getElementById('messages-pin');

export default class Message {
  constructor(type, msg, typeFile) {
    this.id = undefined;
    this.type = type;
    this.typeFile = typeFile; // Тип файла. Используется только в том случае если this.type === 'file';
    this.geolocation = undefined;
    this.timeStamp = new Date();
    this.msg = msg; // аудио/видео сообщения хранятся ввиде строки формата base64
    /* Создаем html элементы (теги) в которых будет хранится контент:
      <p> - текст
      <audio> - аудио сообщение
      <video> - видео сообщение
      <div> - файл.
    */
    if (this.type === 'text') { // текст
      this.msgTag = document.createElement('p');
      this.msgTag.innerHTML = Message.createLink(this.msg); // находим в тексте ссылки и делаем их кликабельными
    }
    if ((this.type === 'audio') || (this.type === 'video')) { // аудио/видео
      this.msgTag = document.createElement(this.type);
      this.msgTag.src = this.msg;
      this.msgTag.controls = true;
    }
    if (this.type === 'file') { // Файл.
      this.msgTag = document.createElement(this.typeFile);
      if (this.typeFile === 'img') this.msgTag.classList.add('msg-img');
      if ((this.typeFile === 'audio') || (this.typeFile === 'video')) this.msgTag.controls = true;
    }
  }

  get time() {
    let day = this.timeStamp.getDate();
    let month = this.timeStamp.getMonth();
    let year = this.timeStamp.getFullYear();
    let hours = this.timeStamp.getHours();
    let minutes = this.timeStamp.getMinutes();
    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;
    if (year < 10) year = `0${year}`;
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    return `${day}-${month}-${year}  ${hours}:${minutes}`;
  }

  get html() {
    // Если сообщение - файл то прописываем src путь т.к. он становится известен не при создании сообщения, а только после присвоения сообщению id на сервере.
    if (this.typeFile) this.msgTag.src = this.msg;
    // Если сообщение - файл то верстаем кнопку download
    const download = (this.typeFile) ? `<a class="download-btn" href="${this.msg}"></a>` : '';
    // Верстаем сообщение.
    const divMessage = document.createElement('div');
    divMessage.classList.add('message');
    divMessage.dataset.id = this.id;
    divMessage.innerHTML = `<div class="msg-header">
                              <div class="dell-btn hidden">&#10060</div>
                              <div class="pin-btn hidden">&#x1F4CC</div>
                              <time>${this.time}</time>
                            </div>
                            <div class="msg"></div>
                            <div class="msg-footer">
                              <div class="geo__block">
                                <img class="img-geo" src="geo.png">
                                <span class= "msg__geo">${this.geolocation}</span>
                              </div>
                              ${download}
                            </div>`;
    const divMsg = divMessage.querySelector('.msg'); // Контент
    divMsg.append(this.msgTag.cloneNode(true));
    const dellBtn = divMessage.getElementsByClassName('dell-btn')[0]; // Кнопка "Удалить сообщение"
    const pinBtn = divMessage.getElementsByClassName('pin-btn')[0]; // Кнопка "закрепить сообщение"
    const downloadBtn = divMessage.getElementsByClassName('download-btn')[0];

    if (downloadBtn) { // Программируем кнопку download
      downloadBtn.addEventListener('click', async (evt) => {
        evt.preventDefault();
        await api.getFile(this.msg);
      });
    }
    divMessage.addEventListener('mouseover', () => { // Показываем кнопки "Удалить сообщение" и "Pin"
      dellBtn.classList.remove('hidden');
      pinBtn.classList.remove('hidden');
    });
    divMessage.addEventListener('mouseout', () => { // Скрываем кнопки "Удалить сообщения" и "Pin"
      dellBtn.classList.add('hidden');
      pinBtn.classList.add('hidden');
    });
    dellBtn.addEventListener('click', async () => { // Клик по кнопке "Удалить сообщения"
      if (await api.deleteMessage(this.id)) dellBtn.closest('.message').remove();
    });
    pinBtn.addEventListener('click', () => { // Клик по кнопке "Pin"
      if (pinMsg.pinned(this)) divMessage.classList.add('hidden');
    });

    // Проверка запинено данное сообщение или нет. Если да то скрываем его
    if (this.id === pinMsg.id) divMessage.classList.add('hidden');

    return divMessage;
  }

  getGeolocation() {
    return this;
  }

  static createLink(text) {
    const links = text.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
    if (links) {
      links.forEach((find) => {
        const replace = `<a href="${find}">${find}</a>`;
        text = text.replace(new RegExp(find, 'g'), replace);
      });
    }
    return text;
  }

  static async createMessage(type, msg, typeFile) {
    const geolocation = new Geolocation(popup);
    await geolocation.getGeo(); // Получаем геоданные.
    const message = new Message(type, msg, typeFile);
    message.geolocation = geolocation.address;
    return message;
  }
}
