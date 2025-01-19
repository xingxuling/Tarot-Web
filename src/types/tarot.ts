export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  type: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  meaning: {
    upright: string;
    reversed: string;
  };
  image: string;
}

export interface SpreadPosition {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  x: number;
  y: number;
  card?: TarotCard & { isReversed: boolean };
}

export interface TarotSpread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  positions: SpreadPosition[];
}
