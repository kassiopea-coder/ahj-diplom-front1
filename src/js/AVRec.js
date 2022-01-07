/* eslint-disable no-async-promise-executor */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */

import Clip from './Clip';

const recordAbort = () => {
  const startRec = document.getElementById('buttons-start-rec'); // Блок с кнопками записи аудио/видео
  const stoptRec = document.getElementById('buttons-stop-rec'); // Блок с кнопками остановки записи аудио/видео
  startRec.classList.remove('hidden');
  stoptRec.classList.add('hidden');
};

export default class AVRec {
  constructor(popup, timerSpan) {
    this.popup = popup;
    this.chunks = [];
    this.recorder = null;
    this.record = null;
    this.recordType = undefined;
    this.recordFormat = undefined;
    this.duration = 0;
    this.durationString = null;
    this.timer = null;
    this.recStatus = false;
    this.time = timerSpan;
    this.callbackOK = undefined;
  }

  clear() {
    this.chunks = [];
    this.recorder = null;
    this.record = null;
    this.recordType = undefined;
    this.recordFormat = undefined;
    this.duration = 0;
    this.durationString = null;
    this.time.textContent = '';
    this.recStatus = false;
    this.callbackOK = undefined;
  }

  async startRecord(type) {
    try {
      if (!navigator.mediaDevices) {
        const title = 'Что-то пошло не так';
        const msg = 'Ваш браузер или устройство не поддерживает запись звука/видео';
        this.popup.showPopup('err', title, msg, recordAbort);
      }
      if (!window.MediaRecorder) {
        const title = 'Что-то пошло не так';
        const msg = 'Разрешите запись звука/видео в браузере';
        this.popup.showPopup('err', title, msg, recordAbort);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: (type === 'video'),
      });
      if ((type === 'video') && (document)) {
        const miniVideo = document.createElement('video');
        miniVideo.controls = true;
        miniVideo.muted = 'muted';
        miniVideo.className = 'mini-video';
        document.body.appendChild(miniVideo);
        miniVideo.srcObject = stream;
        miniVideo.play();
      }
      this.recorder = new MediaRecorder(stream);
      this.recorder.addEventListener('start', () => {
        this.timer = setInterval(() => {
          this.duration += 1;
          let min = Math.trunc(this.duration / 60);
          let sec = this.duration - 60 * min;
          if (min < 10) min = `0${min}`;
          if (sec < 10) sec = `0${sec}`;
          this.time.textContent = `${min}:${sec}`;
        }, 1000);
        this.recStatus = true;
      });
      this.recorder.addEventListener('dataavailable', (evt) => {
        this.chunks.push(evt.data);
      });
      this.recorder.addEventListener('stop', async () => {
        const blob = new Blob(this.chunks, {
          type: `${this.recordType}/${this.recordFormat}`,
        });
        this.record = await Clip.readFileToBase64(blob); // результат в формате base64
        stream.getTracks().forEach((track) => track.stop());
        this.chunks = [];
        if (typeof document !== 'undefined') {
          const minivideo = document.getElementsByClassName('mini-video')[0];
          if (minivideo) minivideo.remove();
        }
        clearInterval(this.timer);
        this.duration = 0;
        this.durationString = null;
        this.recStatus = false;
        this.callbackOK();
      });
      this.recorder.start();
    } catch (error) {
      const title = 'Что-то пошло не так';
      const msgErr = 'Разрешите запись звука/видео в браузере';
      this.popup.showPopup('err', title, msgErr, recordAbort);
      this.clear();
    }
  }

  async startRecordAudio() {
    if (this.recorder) return;
    this.recordType = 'audio';
    this.recordFormat = 'wav';
    await this.startRecord('audio');
  }

  async startRecordVideo() {
    if (this.recorder) return;
    this.recordType = 'video';
    this.recordFormat = 'mp4';
    await this.startRecord('video');
  }

  async recordOk(callback = () => {}) {
    this.callbackOK = callback;
    this.recorder.stop();
    this.recorder = null;
  }

  recordCancel() {
    this.recorder.stop();
    this.clear();
  }
}
