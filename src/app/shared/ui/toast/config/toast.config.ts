import { ToastType } from '@shared/ui';

export interface ToastStyle {
  borderColor: string;
  iconColor: string;
  textColor: string;
  dismissButtonColor: string;
}

export const TOAST_STYLE_MAP: Record<ToastType, ToastStyle> = {
  success: {
    borderColor: 'border-green-400',
    iconColor: 'text-text',
    textColor: 'text-green',
    dismissButtonColor: 'text-green hover:text-green-800 focus:ring-green-500',
  },
  warning: {
    borderColor: 'border-accent-400',
    iconColor: 'text-accent',
    textColor: 'text-accent',
    dismissButtonColor: 'text-accent hover:text-accent-800 focus:ring-accent-500',
  },
  danger: {
    borderColor: 'border-red-400',
    iconColor: 'text-red',
    textColor: 'text-red',
    dismissButtonColor: 'text-red hover:text-red-800 focus:ring-red-500',
  },
} as const;

export const TOAST_ICON_MAP: Record<ToastType, string> = {
  success: 'qlementine-icons:success-12',
  warning: 'qlementine-icons:warning-12',
  danger: 'material-symbols:dangerous',
} as const;

export const TOAST_ARIA_LABEL_MAP: Record<ToastType, string> = {
  success: 'Succès',
  warning: 'Avertissement',
  danger: 'Erreur',
} as const;
