import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { API_URL } from '../../../constantes';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-olvido-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './olvido-contrasena.component.html',
  styleUrl: './olvido-contrasena.component.css'
})
export class OlvidoContrasenaComponent {

  userService = inject(UserService);
  router = inject(Router);
  form: FormGroup;
  enviado = false;
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async enviarCorreoU() {
    this.mensajeError = '';
    if (this.form.invalid) return;

    try {
      await this.userService.recuperarContrasena(this.form.value.email);
      this.enviado = true
      this.router.navigate(['/login']);
      Swal.fire({
        title: "Enlace de recuperacion enviado, revise su bandeja de entrada",
        icon: "success",
        draggable: true
      });
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo no encontrado',
        text: 'Verifique los campos.'
      })
    }
  }
}
