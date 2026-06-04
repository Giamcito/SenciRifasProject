import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {
  user: any;
  uniqueId = '';
  loading = false;
  successMessage = '';
  errorMessage = '';
  passwordForm: FormGroup;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.uniqueId = params.get('uniqueId') || '';
    });

    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (!this.uniqueId && user?.uniqueId) {
        this.uniqueId = user.uniqueId;
      }
    });
  }

  get f() {
    return this.passwordForm.controls;
  }

  cambiarContrasena(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmNewPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      return;
    }

    if (!this.uniqueId) {
      this.errorMessage = 'No se encontró el código público del usuario';
      return;
    }

    this.loading = true;
    this.authService.changePassword({
      uniqueId: this.uniqueId,
      currentPassword: this.passwordForm.value.currentPassword || '',
      newPassword: this.passwordForm.value.newPassword || '',
      confirmNewPassword: this.passwordForm.value.confirmNewPassword || ''
    }).subscribe({
      next: (response: any) => {
        this.successMessage = response.message || 'Contraseña actualizada exitosamente';
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'No se pudo cambiar la contraseña';
        this.loading = false;
      }
    });
  }
}
