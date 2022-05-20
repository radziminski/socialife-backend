export type EventTicketTypeStatsDto = {
  ticketTypeId: number;
  soldTicketsNum: number;
  netPriceEarned: number;
};

export type EventStatsDto = {
  totalSoldTicketsNum: number;
  totalNetPriceEarned: number;
  soldTickets: EventTicketTypeStatsDto[];
  likes: number;
};
