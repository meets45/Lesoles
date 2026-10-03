import './product-card.scss';

import { ProductForm } from '@/components/product-form/product-form';

export default () => {
  customElements.get('product-form') || customElements.define('product-form', ProductForm);
};
