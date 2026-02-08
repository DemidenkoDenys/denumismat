import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-tooltip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="messager-container" [class.expanded]="isMessagerExpanded()">
      <button class="messager-button" (click)="handleMainBtnClick()" aria-label="Toggle Messager">
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
            <!-- Send Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <line x1="22" y1="2" x2="11" y2="13"></line>
               <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          }
        }
      </button>
      @if (isMessagerExpanded()) {
        <div class="messager-content">
          <div class="send-message">
            <textarea [(ngModel)]="messageText" placeholder="Enter your question" maxlength="500" [disabled]="isTextareaDisabled()"></textarea>
          </div>
        </div>
      }
    </div>
  `
})
export class MessageTooltipComponent {
  private http = inject(HttpClient);
  private elementRef = inject(ElementRef);

  isMessagerExpanded = signal(false);
  messageText = signal('');
  isTextareaDisabled = signal(false);
  isError = signal(false);

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
      if (this.isError()) {
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

    this.isTextareaDisabled.set(true);
    this.http.post('http://localhost:3000/send', {
      text: text,
      from: 'test-email@gmail.com',
      subject: 'Question: denumismat app',
    }).subscribe({
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
}
