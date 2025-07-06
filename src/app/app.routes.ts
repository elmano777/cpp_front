import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LittleLoginComponent } from './little-login/little-login.component';
import { BackendComponent } from './backend/backend.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: [
      {
        path: '',
        component: LittleLoginComponent,
      },
      {
        path: 'reservas',
        component: MainComponent,
      },
      {
        path: 'backend',
        component: BackendComponent,
      }
    ],
  }
];
