export type StatItem = { value: string; unit: string; text: string };

export type DepartureRow = {
  name: string;
  route: string;
  departs: string;
  arrives: string;
  tags: string[];
  few: boolean;
};

export type FeatureItem = { title: string; text: string };
export type StepItem = { title: string; text: string };
export type ClassItem = { key: string; tag: string; text: string };
export type SeatPoint = { b: string; t: string };
