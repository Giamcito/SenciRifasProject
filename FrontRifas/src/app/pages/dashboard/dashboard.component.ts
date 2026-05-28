import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any;
  expandedRifas: boolean = true; // Menú de Rifas expandido por defecto
  expandedVendedores: boolean = false; // Menú de Vendedores contraído por defecto
  sidebarOpen$: Observable<boolean>; // Observable del estado del sidebar

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {
    this.sidebarOpen$ = this.sidebarService.sidebarOpen$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      }
      this.user = user;
    });
  }

  toggleRifas(): void {
    this.expandedRifas = !this.expandedRifas;
  }

  toggleVendedores(): void {
    this.expandedVendedores = !this.expandedVendedores;
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

