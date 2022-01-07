/* eslint-disable no-unused-vars */

export default class GeoLocation {
  constructor(popup) {
    this.popup = popup;
    // this.status = '';
    // this.err = '';
    this.coords = undefined;
    this.corrdsText = null;
    this.address = null;
  }

  getGeo() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // this.err = 'Геолокация не поддерживается в Вашем браузере :(';
        // this.status = false;
        // reject();
        this.address = 'Не определено';
        resolve();
      } else {
        navigator.geolocation.getCurrentPosition(async (position) => {
          this.coords = position.coords;
          this.coordsText = `[${this.coords.latitude}, ${this.coords.longitude}]`;
          await this.getPlace();
          this.status = true;
          resolve();
        }, () => {
          // this.err = 'Невозможно получить ваше местоположение :(';
          // this.status = false;
          // reject();
          this.address = 'Не определено';
          resolve();
        });
      }
    });
  }

  async getPlace() {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.coords.latitude}&lon=${this.coords.longitude}&zoom=18&addressdetails=1`);
    const { address } = await response.json();
    const { country, city } = address;
    if ((country) && (city)) {
      this.address = `${country}, ${city}`;
    } else {
      this.address = `Нет данных <br> [${this.coords.latitude.toFixed(5)}, ${this.coords.longitude.toFixed(5)}]`;
    }
  }
}
