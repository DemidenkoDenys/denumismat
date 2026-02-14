import { Component, ChangeDetectionStrategy, input, output, signal, inject, ViewChild, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-form.html',
})
export class AuthForm {
  private readonly store = inject(Store);
  protected readonly currentUser = toSignal(this.store.select(selectUser));

  // Inputs
  readonly name = input<string>('');
  readonly email = input<string>('');
  readonly verifyCode = input<string>('');
  readonly emailDisabled = input<boolean>(false);
  readonly submittedInput = input<boolean>(false);
  readonly showVerifyInput = input(false);

  // Outputs
  readonly formValid = output<boolean>();
  readonly nameChange = output<string>();
  readonly submitForm = output<{ name: string; email: string; verifyCode: string }>();
  readonly emailChange = output<string>();
  readonly verifyCodeChange = output<string>();
  readonly triggerValidation = output<void>();

  // Internal signals
  protected readonly submitted = signal(false);

  // Computed validity signal
  private readonly isFormValid = computed(() => {

    if (!this.authForm) return false;
    return this.authForm.valid;
  });

  @ViewChild('authForm') authForm!: NgForm;

  constructor() {
    // Emit form validity changes
    effect(() => {
      this.formValid.emit(this.isFormValid() ?? false);
    });

    effect(() => {
      if (this.submittedInput()) {
        this.submitted.set(true);
      }
    });
  }

  protected onNameChange(value: string): void {
    this.nameChange.emit(value);
  }

  protected onEmailChange(value: string): void {
    this.emailChange.emit(value);
  }

  protected onVerifyCodeChange(value: string): void {
    this.verifyCodeChange.emit(value);
  }

  protected onVerifyCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 6 digits
    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    // Format as XXX-XXX
    if (value.length >= 4) {
      value = value.substring(0, 3) + '-' + value.substring(3);
    } else if (value.length >= 1) {
      value = value;
    }

    input.value = value;
    this.onVerifyCodeChange(value);
  }

  public showValidationErrors(): void {
    this.submitted.set(true);
    this.triggerValidation.emit();
  }

  protected onSubmit(): void {
    if (this.authForm.valid) {
      this.submitForm.emit({
        name: this.name(),
        email: this.email(),
        verifyCode: this.verifyCode(),
      });
    } else {
      this.submitted.set(true);
    }
  }
}
