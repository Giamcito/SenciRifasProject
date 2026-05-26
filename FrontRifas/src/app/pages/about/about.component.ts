import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  team = [
    {
      name: 'Camilo Giraldo',
      role: 'CEO & Fundador',
      icon: '👨‍💼'
    },
    {
      name: 'Gersain Leal',
      role: 'CTO',
      icon: '👨‍💼'
    },
    {
      name: 'Juan Martínez',
      role: 'Director de Operaciones',
      icon: '👨‍💼'
    },
    {
      name: 'Alejandro Rincón',
      role: 'Gerente de Atención al Cliente',
      icon: '👨‍💼'
    }
  ];
}
