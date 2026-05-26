import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css'
})
export class FeaturesComponent {
  features = [
    {
      icon: '🎰',
      title: 'Rifas Seguras y Verificadas',
      description: 'Todas nuestras rifas pasan por un riguroso proceso de verificación para garantizar la legitimidad y seguridad de cada sorteo.'
    },
    {
      icon: '💰',
      title: 'Premios de Alto Valor',
      description: 'Accede a rifas con premios increíbles que van desde efectivo hasta vehículos, viajes internacionales y más.'
    },
    {
      icon: '⚡',
      title: 'Proceso Rápido y Sencillo',
      description: 'Registrate, compra tu boleto y participa en minutos. Sin complicaciones, todo es intuitivo y fácil de usar.'
    },
    {
      icon: '🔒',
      title: 'Seguridad de Banco',
      description: 'Tus datos personales y transacciones están protegidas con encriptación de nivel militar.'
    },
    {
      icon: '📱',
      title: 'Acceso Multiplataforma',
      description: 'Participa desde tu computadora, tablet o teléfono móvil. La plataforma se adapta a cualquier dispositivo.'
    },
    {
      icon: '🎁',
      title: 'Múltiples Métodos de Pago',
      description: 'Acepta tarjetas de crédito, débito, billeteras digitales y transferencias bancarias para tu comodidad.'
    },
    {
      icon: '📊',
      title: 'Transparencia Total',
      description: 'Visualiza en tiempo real el progreso de cada rifa, cantidad de boletos vendidos y resultados verificados.'
    },
    {
      icon: '🏆',
      title: 'Soporte 24/7',
      description: 'Nuestro equipo de atención al cliente está disponible todo el tiempo para ayudarte con cualquier pregunta.'
    }
  ];
}
