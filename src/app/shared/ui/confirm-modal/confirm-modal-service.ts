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
      const modalRef = createComponent(ConfirmModal, {
        environmentInjector: this.injector,
      });

      modalRef.setInput('data', data);

      const subscription = modalRef.instance.confirmed.subscribe((confirmed: boolean) => {
        subscription.unsubscribe();
        this.closeModal(modalRef);
        resolve(confirmed);
      });

      const cancelSubscription = modalRef.instance.cancelled.subscribe(() => {
        cancelSubscription.unsubscribe();
        this.closeModal(modalRef);
        resolve(false);
      });

      this.showModal(modalRef);

      this.modalComponentRef = modalRef;
    });
  }

  private showModal(modalRef: ComponentRef<ConfirmModal>): void {
    this.appRef.attachView(modalRef.hostView);

    const modalElement = modalRef.location.nativeElement as HTMLElement;
    document.body.appendChild(modalElement);

    this.modalStack.update((stack) => [...stack, modalRef]);

    document.body.style.overflow = 'hidden';
  }

  private closeModal(modalRef: ComponentRef<ConfirmModal>): void {
    this.modalStack.update((stack) => stack.filter((ref) => ref !== modalRef));

    this.appRef.detachView(modalRef.hostView);

    const modalElement = modalRef.location.nativeElement as HTMLElement;
    modalElement?.parentNode?.removeChild(modalElement);

    modalRef.destroy();

    if (this.modalStack().length === 0) {
      document.body.style.overflow = '';
    }

    if (this.modalComponentRef === modalRef) {
      this.modalComponentRef = null;
    }
  }

  closeAllModals(): void {
    const modals = [...this.modalStack()];
    modals.forEach((modalRef) => this.closeModal(modalRef));
  }
}
