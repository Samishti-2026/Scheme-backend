export const RELATIONS = [
  { from: 'customer', to: 'billing', local: 'customer_code', foreign: 'payer' },
  { from: 'material', to: 'billing', local: 'material_code', foreign: 'material' },
  { from: 'customer', to: 'payment', local: 'customer_code', foreign: 'customer_number' },
  { from: 'billing', to: 'payment', local: 'company_code', foreign: 'company_code' },
];

export const ALLOWED_TABLES = ['billing', 'customer', 'material', 'payment'];
