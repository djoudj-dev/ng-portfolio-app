export interface CounterCard {
  id: string;
  icon: string;
  alt: string;
  title: string;
  value: number;
  badge?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}