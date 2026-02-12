import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MainLayoutComponent } from '../../main-layout';
import { setAuthUser, setIsAdmin } from '../../state/auth/auth.actions';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSelectionBarComponent } from '../admin-selection-bar/admin-selection-bar';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, AdminSelectionBarComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-wrapper">
      <app-main-layout></app-main-layout>
      <admin-selection-bar></admin-selection-bar>
    </div>
  `,
})
export class AdminComponent {
  private store = inject(Store);
  private router = inject(Router);

  ngOnInit() {
    this.store.dispatch(setIsAdmin({ isAdmin: true }));
  }

  navigateToUserRoute() {
    this.router.navigate(['/']);
  }

  handleAuthSubmit(data: { name: string; email: string }) {
    const user = {
      uid: `admin-${Date.now()}`,
      displayName: data.name,
      email: data.email,
      photoURL: null
    };

    this.store.dispatch(setAuthUser({ user }));
    this.store.dispatch(setIsAdmin({ isAdmin: true }));
  }
}
