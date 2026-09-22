export type Ono99CardType =
  'NUMBER' | 'MINUS_TEN' | 'REVERSE' | 'PLAY_TWO' | 'ONO99';

export type Ono99Card = {
  id: string;
  type: Ono99CardType;
  value: number;
  label: string;
};
