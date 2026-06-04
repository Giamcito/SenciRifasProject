import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<any>;
  timeRemaining: string = '';
  userMenuOpen: boolean = false;
  mobileMenuOpen: boolean = false;
  private intervalId: any;
  private sidebarSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.updateTimeRemaining();
    this.intervalId = setInterval(() => {
      this.updateTimeRemaining();
    }, 1000);

    // Close user menu when sidebar opens elsewhere
    this.sidebarSub = this.sidebarService.sidebarOpen$.subscribe(open => {
      if (open) {
        this.userMenuOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.sidebarSub) {
      this.sidebarSub.unsubscribe();
    }
  }

  updateTimeRemaining(): void {
    // Solo actualizar si hay un token válido
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    const remaining = this.authService.getTimeRemaining();
    
    if (remaining <= 0) {
      this.timeRemaining = 'Sesión expirada';
      this.logout();
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    this.timeRemaining = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  }

  logout(): void {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }

  toggleSidebar(): void {
    // ensure user menu is closed when toggling sidebar from navbar
    this.userMenuOpen = false;
    this.sidebarService.toggleSidebar();
  }

  toggleUserMenu(): void {
    const willOpen = !this.userMenuOpen;
    this.userMenuOpen = willOpen;
    if (willOpen) {
      // close sidebar if opening user menu
      this.sidebarService.closeSidebar();
    }
  }

  toggleMobileMenu(): void {
    const willOpen = !this.mobileMenuOpen;
    this.mobileMenuOpen = willOpen;
    if (willOpen) {
      // close other menus when opening mobile menu
      this.userMenuOpen = false;
      this.sidebarService.closeSidebar();
    }
  }
}
