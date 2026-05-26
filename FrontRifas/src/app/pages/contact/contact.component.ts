import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  submitForm() {
    // Por ahora solo muestra un mensaje
    if (this.contactForm.name && this.contactForm.email && this.contactForm.message) {
      alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
      this.contactForm = { name: '', email: '', phone: '', message: '' };
    } else {
      alert('Por favor completa todos los campos requeridos');
    }
  }

  contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      value: 'soporte@sencirifas.com',
      description: 'Envíanos tus consultas por correo'
    },
    {
      icon: '📱',
      title: 'WhatsApp',
      value: '+1 (555) 123-4567',
      description: 'Chat rápido y eficiente'
    },
    {
      icon: '📞',
      title: 'Teléfono',
      value: '+1 (555) 123-4567',
      description: 'Llamadas de 8am a 10pm'
    },
    {
      icon: '📍',
      title: 'Ubicación',
      value: 'Calle Principal 123, Ciudad',
      description: 'Visita nuestra oficina'
    }
  ];
}
