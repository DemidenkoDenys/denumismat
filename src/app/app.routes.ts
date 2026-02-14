import { ADTL } from './app.constants';
import { Routes } from '@angular/router';
import { UserService } from './services/user.service';
import { AdminService } from './services/admin.service';
import { AdminComponent } from './components/admin/admin';
import { authAdminGuard } from './guards/admin-auth.guard';
import { UserAuthResolver } from './resolvers/user-auth-resolver';
import { UserWrapperComponent } from './components/user-wrapper/user-wrapper.component';
import { provideEffects } from '@ngrx/effects';
import { UserCoinsEffects } from './state/user-coins.effects';
import { AdminCoinsEffects } from './state/admin-coins.effects';

export const routes: Routes = [
    {
    path: atob(ADTL),
    component: AdminComponent,
    providers: [AdminService, [provideEffects(AdminCoinsEffects)]],
    canActivate: [authAdminGuard],
  },
  {
    path: '',
    component: UserWrapperComponent,
    providers: [UserService, [provideEffects(UserCoinsEffects)]],
    resolve: { resolve: UserAuthResolver }
  }
];
