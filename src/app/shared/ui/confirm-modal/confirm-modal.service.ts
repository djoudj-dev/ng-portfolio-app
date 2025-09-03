import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  signal,
  ComponentRef,
  inject,
} from '@angular/core';
import { ConfirmModal, ConfirmModalData } from '@shared/ui';

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private modalComponentRef: ComponentRef<ConfirmModal> | null = null;
  private readonly modalStack = signal<ComponentRef<ConfirmModal>[]>([]);

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  async confirm(data: ConfirmModalData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Créer le composant de modal
      const modalRef = createComponent(ConfirmModal, {
        environmentInjector: this.injector,
      });

      // Définir les données du modal
      modalRef.setInput('data', data);

      // Écouter les événements de confirmation
      const subscription = modalRef.instance.confirmed.subscribe((confirmed: boolean) => {
        subscription.unsubscribe();
        this.closeModal(modalRef);
        resolve(confirmed);
      });

      // Écouter l'événement d'annulation
      const cancelSubscription = modalRef.instance.cancelled.subscribe(() => {
        cancelSubscription.unsubscribe();
        this.closeModal(modalRef);
        resolve(false);
      });

      // Ajouter le modal au DOM
      this.showModal(modalRef);

      // Stocker la référence
      this.modalComponentRef = modalRef;
    });
  }

  private showModal(modalRef: ComponentRef<ConfirmModal>): void {
    // Attacher le composant à l'application
    this.appRef.attachView(modalRef.hostView);

    // Ajouter au DOM
    const modalElement = modalRef.location.nativeElement as HTMLElement;
    document.body.appendChild(modalElement);

    // Ajouter à la stack des modals
    this.modalStack.update((stack) => [...stack, modalRef]);

    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  private closeModal(modalRef: ComponentRef<ConfirmModal>): void {
    // Retirer de la stack
    this.modalStack.update((stack) => stack.filter((ref) => ref !== modalRef));

    // Détacher de l'application
    this.appRef.detachView(modalRef.hostView);

    // Retirer du DOM
    const modalElement = modalRef.location.nativeElement as HTMLElement;
    modalElement?.parentNode?.removeChild(modalElement);

    // Détruire le composant
    modalRef.destroy();

    // Réactiver le scroll du body si plus de modals
    if (this.modalStack().length === 0) {
      document.body.style.overflow = '';
    }

    // Nettoyer la référence si c'est le modal actuel
    if (this.modalComponentRef === modalRef) {
      this.modalComponentRef = null;
    }
  }

  closeAllModals(): void {
    const modals = [...this.modalStack()];
    modals.forEach((modalRef) => this.closeModal(modalRef));
  }
}
