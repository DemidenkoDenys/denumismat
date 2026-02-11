import { Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin';
import { AdminService } from './services/admin.service';
import { UserService } from './services/user.service';
import { ADTL } from './app.constants';
import { UserWrapperComponent } from './components/user-wrapper/user-wrapper.component';
import { AdminAuthResolver } from './resolvers/admin-auth-resolver';
import { UserAuthResolver } from './resolvers/user-auth-resolver';

export const routes: Routes = [
  {
    path: '',
    component: UserWrapperComponent,
    providers: [AdminService],
    resolve: { resolve: UserAuthResolver }
  },
  {
    path: atob(ADTL),
    component: AdminComponent,
    providers: [UserService],
    resolve: { resolve: AdminAuthResolver }
  }
];
