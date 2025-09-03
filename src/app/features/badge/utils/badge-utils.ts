import { BadgeStatus } from '../models/badge.model';

export class BadgeUtils {
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatDateFull(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static getStatusLabel(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'Disponible';
      case BadgeStatus.UNAVAILABLE:
        return 'Indisponible';
      case BadgeStatus.AVAILABLE_FROM:
        return 'Programmé';
      default:
        return 'Inconnu';
    }
  }

  static getStatusBadgeClass(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100 text-red-800';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  static getStatusOptions() {
    return [
      { value: BadgeStatus.AVAILABLE, label: 'Disponible' },
      { value: BadgeStatus.UNAVAILABLE, label: 'Indisponible' },
      { value: BadgeStatus.AVAILABLE_FROM, label: 'Disponible à partir de' },
    ];
  }
}
