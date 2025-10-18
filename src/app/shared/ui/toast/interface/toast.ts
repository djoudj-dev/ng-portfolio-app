export type ToastType = 'success' | 'danger';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
