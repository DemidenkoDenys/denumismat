# Modal System

This project includes a reusable modal system with a base modal component and specialized modal implementations.

## Components

### BaseModalComponent
A reusable base modal component that provides common modal functionality:

- Backdrop click to close
- Escape key to close
- Body scroll prevention
- Responsive design
- Animations

**Usage:**
```html
<app-base-modal [title]="'My Modal Title'" (onClose)="handleClose()">
  <!-- Your modal content here -->
</app-base-modal>
```

**Inputs:**
- `title: string` - The modal title (default: 'Modal')

**Outputs:**
- `onClose: void` - Emitted when modal should be closed

**Methods:**
- `close()` - Close the modal
- `showModal()` - Show the modal (called automatically)
- `hideModal()` - Hide the modal
- `isVisible(): boolean` - Check if modal is visible

### AuthModalComponent
A specialized modal for authentication that extends the base modal functionality:

**Usage:**
```html
<app-auth-modal
  (onClose)="handleClose()"
  (onSubmit)="handleSubmit($event)"
  (onAuthSuccess)="handleAuthSuccess()">
</app-auth-modal>
```

**Outputs:**
- `onClose: void` - Emitted when modal is closed
- `onSubmit: { name: string; email: string; verifyCode: string }` - Emitted on form submission
- `onAuthSuccess: void` - Emitted when authentication is successful

**Methods:**
- `close()` - Close the modal
- `submit()` - Submit the authentication form
- `signInWithGoogle()` - Trigger Google sign-in
- `resetForm()` - Reset all form fields
- `prefillUserData(user: { name?: string; email?: string })` - Prefill form with user data
- `enableEmailField()` - Enable the email input field
- `disableEmailField()` - Disable the email input field
- `isFormSubmitting(): boolean` - Check if form is currently submitting
- `isFormReady(): boolean` - Check if form is valid and ready to submit

## ModalService

A service for managing modal state across the application:

**Usage:**
```typescript
import { ModalService } from './services/modal.service';

constructor(private modalService: ModalService) {}

// Show auth modal
this.modalService.showAuthModal();

// Show auth modal with user data
this.modalService.showAuthModalWithUserData({ name: 'John', email: 'john@example.com' });

// Check if auth modal is visible
const isVisible = this.modalService.isAuthModalVisible();

// Get auth modal data
const data = this.modalService.getAuthModalData();

// Hide auth modal
this.modalService.hideAuthModal();
```

**Methods:**
- `showAuthModal(data?: any)` - Show authentication modal
- `hideAuthModal()` - Hide authentication modal
- `getAuthModalState()` - Get auth modal state as signal
- `isAuthModalVisible()` - Check if auth modal is visible
- `getAuthModalData()` - Get auth modal data
- `showOrderModal(data?: any)` - Show order modal
- `hideOrderModal()` - Hide order modal
- `showModal(type, data?)` - Generic method to show any modal
- `hideModal(type)` - Generic method to hide any modal
- `resetAllModals()` - Hide all modals

## Features

- **Responsive Design**: Modals work well on mobile and desktop
- **Accessibility**: Proper focus management and keyboard navigation
- **Animations**: Smooth fade-in and slide-in animations
- **State Management**: Integrated with NgRx store for auth state
- **Type Safety**: Full TypeScript support with proper interfaces
- **Reusable**: Base modal can be extended for different use cases

## Styling

The base modal includes default styling that can be customized via CSS variables or by overriding the component styles. The modal uses a clean, modern design with:

- Semi-transparent backdrop
- Rounded corners and shadows
- Responsive padding and sizing
- Smooth transitions

## Integration

The modal system integrates with:
- Angular's dependency injection
- NgRx store for state management
- Translation service for i18n
- Form validation and error handling
