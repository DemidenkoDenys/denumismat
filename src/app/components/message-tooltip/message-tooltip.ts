import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, HostListener, output, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../state/auth/auth.selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectServerIsAvailable } from '../../state/server.selectors';

@Component({
  selector: 'app-message-tooltip',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="messager-container" [class.expanded]="isMessagerExpanded()">
      <button class="messager-button" (click)="handleMainBtnClick()" [disabled]="!isLoggedIn() || !isServerAvailable()" aria-label="Toggle Messager">
        @if (!isMessagerExpanded()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        } @else {
          @if (isError()) {
            <!-- Close Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          } @else {
            @if (messageText().trim().length > 0) {
              <!-- Send Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <line x1="22" y1="2" x2="11" y2="13"></line>
                 <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            } @else {
              <!-- Close Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            }
          }
        }
      </button>

      @if (!isLoggedIn()) {
        <div class="tooltip top" role="tooltip">
          {{ 'messageTooltip.authRequired' | translate }}
        </div>
      }

      @if (isMessagerExpanded()) {
        <div class="messager-content">
          <div class="send-message">
            <textarea
              maxlength="200"
              [disabled]="isTextareaDisabled()"
              [(ngModel)]="messageText"
              [placeholder]="'messageTooltip.enterYourQuestion' | translate"
              ></textarea>
          </div>
        </div>
      }
    </div>
  `
})
export class MessageTooltipComponent {
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);


  isError = signal(false);
  messageText = signal('');
  authRequired = signal(false);
  isMessagerExpanded = signal(false);
  isTextareaDisabled = signal(false);
  authSuccessTrigger = input(0);
  onAuthRequired = output<void>();

  public isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  public isServerAvailable = toSignal(this.store.select(selectServerIsAvailable), { initialValue: false });

  constructor() {
    effect(() => {
      const isLoggedIn = this.store.selectSignal(selectIsLoggedIn)();
      // If user just logged in and we were waiting for auth, send the message
      if (isLoggedIn && this.authRequired()) {
        this.authRequired.set(false);
        this.sendMessageAfterAuth();
      }
    });

    effect(() => {
      // Listen for auth success trigger changes
      this.authSuccessTrigger();
      if (this.authRequired()) {
        this.authRequired.set(false);
        this.sendMessageAfterAuth();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isMessagerExpanded() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMessager();
    }
  }

  toggleMessager() {
    this.isMessagerExpanded.update(v => !v);
  }

  handleMainBtnClick() {
    if (this.isMessagerExpanded()) {
      // Close mode: error or textarea empty
      if (this.isError() || this.messageText().trim().length === 0) {
        this.closeMessager();
      } else {
        this.sendMessage();
      }
    } else {
      this.openMessager();
    }
  }

  openMessager() {
    this.isMessagerExpanded.set(true);
    // Reset state on open if it was error
    if (this.isError()) {
      this.resetState();
    }
  }

  closeMessager() {
    this.isMessagerExpanded.set(false);
    if (this.isError()) {
      this.resetState();
    }
  }

  resetState() {
    this.isError.set(false);
    this.messageText.set('');
    this.isTextareaDisabled.set(false);
  }

  sendMessage() {
    const text = this.messageText();
    if (!text.trim()) {
      return;
    }

    // Check if user is logged in
    const isLoggedIn = this.store.selectSignal(selectIsLoggedIn)();
    if (!isLoggedIn) {
      this.authRequired.set(true);
      this.onAuthRequired.emit();
      return;
    }

    this.sendMessageRequest(text);
  }

  private sendMessageRequest(text: string) {
    this.isTextareaDisabled.set(true);
    this.notificationService.sendMessage(text).subscribe({
      next: () => {
        this.messageText.set('');
        this.isTextareaDisabled.set(false);
        this.isMessagerExpanded.set(false); // Close on success
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.messageText.set('Error');
        this.isTextareaDisabled.set(true);
        this.isError.set(true);
      }
    });
  }

  private sendMessageAfterAuth() {
    const text = this.messageText();
    if (text.trim()) {
      this.sendMessageRequest(text);
    }
  }
}
