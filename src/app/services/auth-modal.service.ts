import { Injectable, signal } from '@angular/core';
import { Observable, distinctUntilChanged, map, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export interface ModalState {
  isVisible: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  public authModalState = signal<ModalState>({ isVisible: false });
  public orderModalState = signal<ModalState>({ isVisible: false });
  // Observable for auth modal state changes
  private authModalState$ = toObservable(this.authModalState).pipe(
    distinctUntilChanged(),
    startWith(this.authModalState())
  );
  // Auth Modal Methods
  showAuthModal(data?: any) {
    this.authModalState.set({ isVisible: true, data });
  }

  hideAuthModal() {
    this.authModalState.set({ isVisible: false });
  }

  isAuthModalVisible() {
    return this.authModalState().isVisible;
  }

  getAuthModalData() {
    return this.authModalState().data;
  }

  getAuthModalStateChanges(): Observable<ModalState> {
    return this.authModalState$;
  }

  // Order Modal Methods
  showOrderModal(data?: any) {
    this.orderModalState.set({ isVisible: true, data });
  }

  hideOrderModal() {
    this.orderModalState.set({ isVisible: false });
  }

  getOrderModalState() {
    return this.orderModalState.asReadonly();
  }

  isOrderModalVisible() {
    return this.orderModalState().isVisible;
  }

  getOrderModalData() {
    return this.orderModalState().data;
  }

  // Generic Modal Methods
  showModal(modalType: 'auth' | 'order', data?: any) {
    switch (modalType) {
      case 'auth':
        this.showAuthModal(data);
        break;
      case 'order':
        this.showOrderModal(data);
        break;
    }
  }

  hideModal(modalType: 'auth' | 'order') {
    switch (modalType) {
      case 'auth':
        this.hideAuthModal();
        break;
      case 'order':
        this.hideOrderModal();
        break;
    }
  }

  isModalVisible(modalType: 'auth' | 'order'): boolean {
    switch (modalType) {
      case 'auth':
        return this.isAuthModalVisible();
      case 'order':
        return this.isOrderModalVisible();
      default:
        return false;
    }
  }

  getModalData(modalType: 'auth' | 'order') {
    switch (modalType) {
      case 'auth':
        return this.getAuthModalData();
      case 'order':
        return this.getOrderModalData();
    }
  }

  // Utility methods for auth modal
  showAuthModalWithUserData(userData: { name?: string; email?: string }) {
    this.showAuthModal(userData);
  }

  showAuthModalForRegistration() {
    this.showAuthModal({ mode: 'register' });
  }

  showAuthModalForLogin() {
    this.showAuthModal({ mode: 'login' });
  }

  showAuthModalForAdmin() {
    this.showAuthModal({
      mode: 'admin',
      title: 'Admin Authentication Required',
      message: 'Please authenticate to access the admin panel.'
    });
  }

  // Reset all modals
  resetAllModals() {
    this.hideAuthModal();
    this.hideOrderModal();
  }
}
