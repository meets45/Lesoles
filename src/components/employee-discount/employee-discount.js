import './employee-discount.scss';

class EmployeeDiscount extends HTMLElement {
  constructor() {
    super()
    this.elements = {
      modal: document.querySelector('site-modal'),
      banner: document.querySelector('[data-employee-discount-banner]')
    }
    this.state = {
      isEmployee: document.documentElement.hasAttribute('data-employee'),
      termsAccepted: null
    }

    this.init()
  }

  async init() {
    await this.checkCartState()

    if (!this.state.isEmployee) return

    await this.checkTermsAcceptance()
    this.setupEventListeners()
    this.handleInitialDisplay()
  }

  async checkCartState() {
    try {
      const response = await fetch(`${window.routes.cart_url}.js`)
      const { attributes } = await response.json()

      // Clear attributes if they exist but the user isn't logged in or isn't an employee
      if (attributes?.employee_terms_accepted && (!window.customer?.loggedIn && !window.customer?.isEmployee)) {
        await this.clearCartAttributes()
      }
    } catch (error) {
      console.error('Error checking cart state:', error)
    }
  }

  async checkTermsAcceptance() {
    try {
      const response = await fetch(`${window.routes.cart_url}.js`)
      const { attributes } = await response.json()
      this.state.termsAccepted = attributes?.employee_terms_accepted
    } catch (error) {
      console.error('Error checking terms acceptance:', error)
    }
  }

  setupEventListeners() {
    this.querySelector('[data-terms-accept]')?.addEventListener('click', () => this.handleTerms(true))
    this.querySelector('[data-terms-reject]')?.addEventListener('click', () => this.handleTerms(false))
  }

  handleInitialDisplay() {
    // Only show modal if terms haven't been set yet and employee attribute is present
    if (!this.state.termsAccepted && this.state.isEmployee) {
      this.showTermsModal()
      return
    }

    // Show banner if terms were accepted
    if (this.state.termsAccepted === 'true' && this.state.isEmployee) {
      this.showBanner()
    }
  }

  async handleTerms(accepted) {
    await this.updateTerms(accepted)
    this.closeModal()
    accepted ? this.showBanner() : this.hideBanner()
  }

  async updateTerms(accepted) {
    try {
      await fetch(window.routes.cart_update_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: { employee_terms_accepted: String(accepted) }
        })
      })
      this.state.termsAccepted = String(accepted)
    } catch (error) {
      console.error('Error updating terms:', error)
    }
  }

  showTermsModal() {
    this.elements.modal?.setAttribute('data-force-open', '')
    this.elements.modal?.open()
  }

  closeModal() {
    this.elements.modal?.removeAttribute('data-force-open')
    this.elements.modal?.close()
  }

  showBanner() {
    this.elements.banner && (this.elements.banner.style.display = 'flex')
  }

  hideBanner() {
    this.elements.banner && (this.elements.banner.style.display = 'none')
  }

  async clearCartAttributes() {
    try {
      await fetch(window.routes.cart_update_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            employee_terms_accepted: null
          }
        })
      })
    } catch (error) {
      console.error('Error clearing cart attributes:', error)
    }
  }
}

export default () => {
  customElements.get('employee-discount') || customElements.define('employee-discount', EmployeeDiscount);
};
