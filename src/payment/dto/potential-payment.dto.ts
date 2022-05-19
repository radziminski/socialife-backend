export type TicketPriceDto = {
  ticketTypeId: number;
  price: number;
};

export type PotentialPaymentDto = {
  netPrice: number;
  fees: number;
  vat: number;
  totalPrice: number;
  ticketPrices: TicketPriceDto[];
};
