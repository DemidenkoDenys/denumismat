import { ADTL } from './app.constants';
import { Routes } from '@angular/router';
import { UserService } from './services/user.service';
import { AdminService } from './services/admin.service';
import { AdminComponent } from './components/admin/admin';
import { authAdminGuard } from './guards/admin-auth.guard';
import { UserAuthResolver } from './resolvers/user-auth-resolver';
import { UserWrapperComponent } from './components/user-wrapper/user-wrapper.component';

export const routes: Routes = [
  {
    path: '',
    component: UserWrapperComponent,
    providers: [UserService],
    resolve: { resolve: UserAuthResolver }
  },
  {
    path: atob(ADTL),
    component: AdminComponent,
    providers: [AdminService],
    canActivate: [authAdminGuard],
  }
];
