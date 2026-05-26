import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = [
    {
      icon: '🎰',
      title: 'Rifas Seguras',
      description: 'Todas nuestras rifas están verificadas y son 100% seguras'
    },
    {
      icon: '💰',
      title: 'Premios Increíbles',
      description: 'Gana premios de alto valor participando en nuestras rifas'
    },
    {
      icon: '⚡',
      title: 'Rápido y Fácil',
      description: 'Registrate, compra tu boleto y comienza a ganar en minutos'
    },
    {
      icon: '🔒',
      title: 'Totalmente Seguro',
      description: 'Tus datos y dinero están protegidos con encriptación de nivel banco'
    }
  ];

  testimonials = [
    {
      name: 'Carlos M.',
      message: 'Ganó 500.000 en su primera rifa. Muy confiable!',
      rating: 5
    },
    {
      name: 'María L.',
      message: 'La mejor plataforma de rifas que he encontrado.',
      rating: 5
    },
    {
      name: 'Juan P.',
      message: 'Fácil de usar y muy transparente. Recomendado!',
      rating: 5
    }
  ];
}
