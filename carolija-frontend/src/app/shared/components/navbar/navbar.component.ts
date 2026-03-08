import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isMenuOpen = false;
  showLogoutModal = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ){}

  toggleMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['']);
    this.isMenuOpen = false;
    this.showLogoutModal = false;
  }

  openLogoutModal(){
    this.showLogoutModal = true;
    this.isMenuOpen = false;
  }

  cancelLogout(){
    this.showLogoutModal = false;
  }

  
}
