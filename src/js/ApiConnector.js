/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-cycle */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-return */

import Message from './Message';

/* eslint-disable no-useless-escape */
class ApiConnector {
  constructor(url) {
    this.url = url;
    // this.contentTypeHeader = { 'Content-Type': 'application/json' };
    this.contentTypeHeader = { 'Content-Type': 'application/x-www-form-urlencoded' };
  }

  async getMessages(msgListDiv, id = null) { // Загрузка сообщений с сервера
    // Запоминаем размер скрола, чтобы после подрузки новой порции сообщений восстановить его позицию
    const beforeScrolHeight = msgListDiv.scrollHeight;
    let URL = this.url;
    if (id) {
      URL += `?id=${id}`; // Передаем id первого сообщения в списке.
    }
    const response = await fetch(URL);
    const messagesList = Array.from(await response.json());
    messagesList.forEach((msg) => {
      const message = new Message(msg.type, msg.msg, msg.typeFile, msg.extFile);
      for (const prop in msg) {
        message[prop] = msg[prop];
      }
      message.timeStamp = new Date(message.timeStamp);
      msgListDiv.prepend(message.html);
    });
    // Восстанавливаем скорл или прокручиваем вниз (если загружается первая порция сообщений)
    msgListDiv.scrollTop = (id) ? msgListDiv.scrollHeight - beforeScrolHeight : msgListDiv.scrollHeight;
  }

  async getPinMsg(pinMsg) {
    const response = await fetch(`${this.url}?event=getPinMsg`);
    const msg = await response.json();
    if (msg) {
      const message = new Message(msg.type, msg.msg, msg.typeFile);
      for (const prop in msg) message[prop] = msg[prop];
      message.timeStamp = new Date(message.timeStamp);
      pinMsg.pinned(message, false);
    }
  }

  async getFile(fileURL) {
    const loader = document.getElementsByClassName('cssload-loading')[0]; // Анимация загрузки
    const container = document.getElementsByClassName('container')[0]; // Контейнер.
    loader.classList.remove('hidden');
    container.classList.add('blocked');
    const response = await fetch(fileURL);
    const BlobImage = await response.blob();
    const urlImage = URL.createObjectURL(BlobImage);
    const link = document.createElement('a');
    link.href = urlImage;
    link.download = 'YourFile';
    link.click();
    link.remove();
    loader.classList.add('hidden');
    container.classList.remove('blocked');
  }

  async pushMessage(msg) { // Загрузка сообщения на сервер
    const obj = {
      msg: msg.msg,
      type: msg.type,
      typeFile: msg.typeFile,
      geolocation: msg.geolocation,
      timeStamp: +msg.timeStamp,
    };
    const formData = new FormData();
    formData.append('msg', JSON.stringify(obj));
    if (msg.typeFile) formData.append('file', msg.msg);
    const response = await fetch(this.url, {
      method: 'POST',
      body: formData,
    });
    const responseObj = await response.json();
    msg.id = await responseObj.id;
    if (responseObj.msg) {
      msg.msg = responseObj.msg;
    }
  }

  async pinnedMessage(id) {
    const formData = new FormData();
    formData.append('id', id);
    const response = await fetch(this.url, {
      method: 'PATCH',
      body: formData,
    });
    const result = await response.json();
    return (result === 'OK');
  }

  async unPinnedMessage() {
    const response = await fetch(this.url, {
      method: 'PATCH',
    });
    const result = await response.json();
    return (result === 'OK');
  }

  async deleteMessage(id) { // Удаление сообщения
    const URL = `${this.url}?id=${id}`;
    const response = await fetch(URL, {
      method: 'DELETE',
    });
    const result = await response.json();
    return (result === 'OK');
  }

  // eslint-disable-next-line class-methods-use-this
  downloadBase64File(contentBase64, fileName) {
    const linkSource = contentBase64;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();
  }
}

const url = 'https://ahj-diplom-11.herokuapp.com/';
// const url = '/api/';
// const url = 'http://localhost:7071'
const api = new ApiConnector(url);
export default api;
