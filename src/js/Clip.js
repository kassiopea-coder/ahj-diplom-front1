/* eslint-disable max-len */
import popup from './Popup';

export default class Clip {
  constructor(dropArea, callback) {
    this.maxSize = 734003200;
    this.dropArea = dropArea;
    this.inputFile = document.createElement('input');
    this.init();
    this.file = null;
    this.base64 = null;
    this.createMsg = callback;
  }

  init() {
    this.inputFile.type = 'file';
    this.inputFile.accept = 'audio/*, video/*, image/*';
    // Выбор файла через диалоговое окно
    this.inputFile.addEventListener('change', async (event) => {
      this.file = event.currentTarget.files.item(0);
      this.validFile();
    });
    // Drag&Drop
    this.dropArea.addEventListener('dragover', (event) => event.preventDefault());
    this.dropArea.addEventListener('drop', async (event) => {
      event.preventDefault();
      if (event.dataTransfer.files.length === 1) {
        this.file = event.dataTransfer.files.item(0);
        this.validFile();
      }
    });
  }

  openWindowsChangeFile() {
    this.file = null;
    // this.base64 = null;
    this.inputFile.value = '';
    this.inputFile.click();
  }

  // Проверка типа файла
  get typeFile() {
    let typeFile;
    if (this.file.type.indexOf('image') >= 0) typeFile = 'img';
    else if (this.file.type.indexOf('audio') >= 0) typeFile = 'audio';
    else if (this.file.type.indexOf('video') >= 0) typeFile = 'video';
    return typeFile;
  }

  async validFile() {
    if ((this.typeFile) && (this.file.size < this.maxSize)) { // Проверка на соответсвие типа файла и размера
      this.createMsg(this.file, this.typeFile);
      return;
    }
    this.file = null;
    const title = 'Что-то пошло не так';
    const msgErr = 'Резрешается загружать файлы формата аудио видео и картинки \n Максимальный объем загружаемого файла 700 MB (734003200 Byte)';
    popup.showPopup('err', title, msgErr);
  }

  // Для записи Аудио/Видео сообщений и загрузки файлов.
  static readFileToBase64(file) {
    return new Promise((resolve) => {
      if (!file) resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (readerEvent) => {
        resolve(readerEvent.target.result);
      };
    });
  }
}
