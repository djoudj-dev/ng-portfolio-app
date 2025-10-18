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
  private readonly modalStack = signal<ComponentRef<ConfirmModal>[]>([]);
  private readonly previousFocusMap = new Map<ComponentRef<ConfirmModal>, HTMLElement | null>();

  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  async confirm(data: ConfirmModalData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const modalRef = createComponent(ConfirmModal, {
        environmentInjector: this.injector,
      });

      const previouslyFocused = (document.activeElement as HTMLElement) ?? null;
      this.previousFocusMap.set(modalRef, previouslyFocused);

      modalRef.setInput('data', data);

      const confirmedSub = modalRef.instance.confirmed.subscribe((confirmed: boolean) => {
        confirmedSub.unsubscribe();
        cancelledSub.unsubscribe();
        this.closeModal(modalRef);
        resolve(confirmed);
      });

      const cancelledSub = modalRef.instance.cancelled.subscribe(() => {
        confirmedSub.unsubscribe();
        cancelledSub.unsubscribe();
        this.closeModal(modalRef);
        resolve(false);
      });

      this.showModal(modalRef);
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

    const previouslyFocused = this.previousFocusMap.get(modalRef);
    this.previousFocusMap.delete(modalRef);

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      setTimeout(() => previouslyFocused.focus(), 0);
    }

    if (this.modalStack().length === 0) {
      document.body.style.overflow = '';
    }
  }

  closeAllModals(): void {
    [...this.modalStack()].forEach((modalRef) => this.closeModal(modalRef));
  }
}
