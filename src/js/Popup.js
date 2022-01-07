/* eslint-disable prefer-destructuring */
/* eslint-disable no-use-before-define */
class Popup {
  constructor(container) {
    this.type = '';
    this.result = false;
    this.callback = () => {};
    this.init();
    this.container = container;
  }

  init() {
    if (typeof document !== 'undefined') {
      this.elPopup = document.createElement('div');
      this.elPopup.className = 'popup hidden';
      this.elPopup.innerHTML = `
    <p class="popup-header"></p>
    <p class="popup-msg"></p>
    <div class="popup-buttons">
      <div class="popup-ok popup-btn">OK</div>
    </div>
    `;
      document.body.appendChild(this.elPopup);

      this.elPopupHeader = document.querySelector('.popup-header');
      this.elPopupMsg = document.querySelector('.popup-msg');
      this.btnOk = document.querySelector('.popup-ok');
    }

    this.btnOk.addEventListener('click', () => {
      this.callback();
      this.closePopup();
      this.callback = () => {};
    });
  }

  showPopup(type, header, msg, callback = () => {}) {
    this.type = type;
    this.elPopup.classList.remove('hidden');
    this.elPopupHeader.innerText = header;
    this.elPopupMsg.innerText = msg;
    this.callback = callback;
    if (this.type === 'input') {
      /* this.elPopupInput.classList.remove('hidden');
      this.btnCancel.classList.remove('hidden');
      this.elPopupMsgInput.classList.remove('hidden'); */
    }
    this.container.classList.add('blocked');
    // document.getElementById('controll').classList.add('hidden');
  }

  closePopup() {
    this.elPopup.classList.add('hidden');
    this.elPopupHeader.innerText = null;
    this.elPopupMsg.innerText = null;
    this.container.classList.remove('blocked');
  }
}

const container = document.querySelector('.container');

const popup = new Popup(container);
export default popup;
