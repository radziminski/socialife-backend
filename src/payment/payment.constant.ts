import { PaymentMethod } from './payment-method.enum';

export type PaymentFee = {
  type: 'percent' | 'constant';
  amount: number;
};

export const FEE_FOR_PAYMENT_METHOD: Record<PaymentMethod, PaymentFee> = {
  [PaymentMethod.Card]: {
    type: 'percent',
    amount: 10,
  },
  [PaymentMethod.Transfer]: {
    type: 'constant',
    amount: 0,
  },
  [PaymentMethod.Blik]: {
    type: 'percent',
    amount: 2,
  },
};

export const VAT_PERCENT = 32;
