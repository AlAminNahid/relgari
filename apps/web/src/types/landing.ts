export type DepartureRow = {
  name: string;
  route: string;
  departs: string;
  arrives: string;
  tags: string[];
  few: boolean;
};

export type StepItem = { title: string; text: string };
export type SeatPoint = { b: string; t: string };
