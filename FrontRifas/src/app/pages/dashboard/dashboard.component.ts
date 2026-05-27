import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any;
  activeSection: string = 'crear'; // Sección activa por defecto
  expandedRifas: boolean = true; // Menú de Rifas expandido por defecto
  expandedVendedores: boolean = false; // Menú de Vendedores contraído por defecto
  sidebarOpen: boolean = false; // Sidebar cerrado en móviles por defecto

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

