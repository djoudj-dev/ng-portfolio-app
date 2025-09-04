export interface CounterCard {
  id: string;
  icon: string;
  alt: string;
  title: string;
  value: number | string;
  badge?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}