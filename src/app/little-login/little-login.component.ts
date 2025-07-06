import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-little-login',
  imports: [FormsModule],
  templateUrl: './little-login.component.html',
})
export class LittleLoginComponent {
  userName: string = '';

  constructor(private router: Router) {}

  login() {
    if (this.userName.trim()) {
      localStorage.setItem('userName', this.userName);
      this.router.navigate(['/reservas']);
    }
  }
}
