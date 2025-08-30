export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  duration?: number; // in milliseconds
  confirmText?: string;
  cancelText?: string;
  showClose?: boolean;
}
