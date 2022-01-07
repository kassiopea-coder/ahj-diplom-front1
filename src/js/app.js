/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import AVRec from './AVRec';
import popup from './Popup';
import Message from './Message';
import Clip from './Clip';
import api from './ApiConnector';
import pinMsg from './PinMessage';
import './emoji';

function load(document) {
  if (!document) { // Ранний выход
    return;
  }

  const messagesList = document.getElementById('messages-list'); // список сообщений
  const input = document.getElementById('input'); // input для ввода сообщения
  const btnClip = document.getElementById('clip-btn'); // Кнопка для загрузки файлов.
  const btnRecAudio = document.getElementById('audio-start-btn'); // Кнопка записи аудио сообщения
  const btnRecVideo = document.getElementById('video-start-btn'); // Кнопка записи аудио сообщения
  const startRec = document.getElementById('buttons-start-rec'); // Блок с кнопками записи аудио/видео
  const stoptRec = document.getElementById('buttons-stop-rec'); // Блок с кнопками остановки записи аудио/видео
  const timer = document.getElementById('timer'); // Таймер (длительность видео/аудио записи)
  const btnOk = document.getElementById('ok-btn'); // Остановка виде/аудио записи. Сохранение
  const btnCancel = document.getElementById('cancel-btn'); // Остановка виде/аудио записи. Отмена

  api.getPinMsg(pinMsg); // Загружаем pin-сообщение (если оно есть).
  api.getMessages(messagesList); // Загружаем последние 10 сообщений
  const avRec = new AVRec(popup, timer);
  const clip = new Clip(messagesList, async (file, typeFile) => {
    const msg = await Message.createMessage('file', file, typeFile);
    await api.pushMessage(msg);
    await messagesList.append(msg.html);
    messagesList.scrollTop = messagesList.scrollHeight; // скрол вниз
  });

  messagesList.addEventListener('scroll', () => {
    if (messagesList.scrollTop === 0) {
      const { id } = messagesList.firstChild.dataset;
      api.getMessages(messagesList, id); // Загружаем порцию сообщений.
    }
  });

  // Запуск запись Аудио
  btnRecAudio.addEventListener('click', async () => {
    startRec.classList.add('hidden');
    await avRec.startRecordAudio();
    stoptRec.classList.remove('hidden');
  });

  // Запуск запись Видео
  btnRecVideo.addEventListener('click', async () => {
    startRec.classList.add('hidden');
    await avRec.startRecordVideo();
    stoptRec.classList.remove('hidden');
  });

  // Завершение и сохранение видео/аудио сообщения
  btnOk.addEventListener('click', () => {
    startRec.classList.remove('hidden');
    stoptRec.classList.add('hidden');
    avRec.recordOk(async () => {
      const msg = await Message.createMessage(avRec.recordType, avRec.record);
      avRec.clear();
      await api.pushMessage(msg);
      messagesList.append(msg.html);
      messagesList.scrollTop = messagesList.scrollHeight; // скрол вниз
    });
  });

  // Отмена записи аудио/видео сообщения
  btnCancel.addEventListener('click', () => {
    startRec.classList.remove('hidden');
    stoptRec.classList.add('hidden');
    avRec.recordCancel();
  });

  // Отправув текстового сообщения
  input.addEventListener('keydown', async (event) => {
    if (event.code !== 'Enter') {
      return;
    }
    if (!input.value) {
      return;
    }
    const msg = await Message.createMessage('text', event.target.value);
    await api.pushMessage(msg);
    messagesList.append(msg.html);
    messagesList.scrollTop = messagesList.scrollHeight; // скрол вниз
    event.target.value = null;
  });

  btnClip.addEventListener('click', () => {
    clip.openWindowsChangeFile();
  });
}

load(document);
