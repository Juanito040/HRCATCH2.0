import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../constantes';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import Swal from 'sweetalert2';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.css'
})
export class CambiarContrasenaComponent implements OnInit {
  form: FormGroup;
  token = '';
  mensaje = '';
  error = '';
  contraseñascoinciden = true
  userService = inject(UserService);



  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      nuevaContrasena2: ['', [Validators.required, Validators.minLength(8)]]
    },
      {
      });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    sessionStorage.setItem('utoken', this.token);



  }

  async actualizarContrasena() {
    this.error = '';
    this.mensaje = '';
    if (this.form.invalid) return;

    if (this.form.value.nuevaContrasena !== this.form.value.nuevaContrasena2) {
      Swal.fire({
        icon: 'warning',
        title: 'Las Contraseñas no coinciden',
        text: 'Verifique los campos.'
      })
      return;
    } else {
      try {
        await this.userService.cambiarContrasena(this.form.value);
        this.mensaje = 'Contraseña actualizada con éxito. Serás redirigido al login.';
        setTimeout(() => this.router.navigate(['/login']), 3005);
      } catch (error) {
        Swal.fire({
          icon: 'warning',
          title: 'No fue posible realizar el cambio de contraseña',
          text: 'Token inválido o expirado.'
        })
      }
    }
  }

  validarContrasenas() {
    if (this.form.value.nuevaContrasena !== this.form.value.nuevaContrasena2) {
      return false;
    } else {
      return true;
    }
  }
}
