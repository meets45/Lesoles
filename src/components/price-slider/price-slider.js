import './price-slider.scss';

class PriceSlider extends HTMLElement {
  constructor() {
    super();
    this.minRange = this.querySelector('[data-slider-min]');
    this.maxRange = this.querySelector('[data-slider-max]');
    this.minInput = this.querySelector('[data-min-input]');
    this.maxInput = this.querySelector('[data-max-input]');
    this.progress = this.querySelector('[data-slider-progress]');

    this.min = Number(this.dataset.min);
    this.max = Number(this.dataset.max);
    this.currency = this.dataset.currency;

    this.setupEventListeners();
    this.updateProgress();
  }

  setupEventListeners() {
    // Range input events
    this.minRange.addEventListener('input', () => {
      const minVal = Number(this.minRange.value);
      const maxVal = Number(this.maxRange.value);

      if (minVal > maxVal) {
        this.minRange.value = maxVal;
        return;
      }

      this.minInput.value = minVal;
      this.updateProgress();
      this.triggerChange(this.minInput);
    });

    this.maxRange.addEventListener('input', () => {
      const minVal = Number(this.minRange.value);
      const maxVal = Number(this.maxRange.value);

      if (maxVal < minVal) {
        this.maxRange.value = minVal;
        return;
      }

      this.maxInput.value = maxVal;
      this.updateProgress();
      this.triggerChange(this.maxInput);
    });

    // Number input events
    this.minInput.addEventListener('change', () => {
      let value = Number(this.minInput.value);

      if (value < this.min) value = this.min;
      if (value > Number(this.maxInput.value)) value = Number(this.maxInput.value);

      this.minInput.value = value;
      this.minRange.value = value;
      this.updateProgress();
    });

    this.maxInput.addEventListener('change', () => {
      let value = Number(this.maxInput.value);

      if (value > this.max) value = this.max;
      if (value < Number(this.minInput.value)) value = Number(this.minInput.value);

      this.maxInput.value = value;
      this.maxRange.value = value;
      this.updateProgress();
    });
  }

  updateProgress() {
    const minVal = Number(this.minRange.value);
    const maxVal = Number(this.maxRange.value);
    const minPercent = ((minVal - this.min) / (this.max - this.min)) * 100;
    const maxPercent = ((maxVal - this.min) / (this.max - this.min)) * 100;

    this.progress.style.left = `${minPercent}%`;
    this.progress.style.width = `${maxPercent - minPercent}%`;
  }

  triggerChange() {
    // Ensure both inputs trigger change for proper URL params
    this.minInput.dispatchEvent(new Event('change', { bubbles: true }));
    this.maxInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export default () => {
  customElements.get('price-slider') ||
    customElements.define('price-slider', PriceSlider);
};
