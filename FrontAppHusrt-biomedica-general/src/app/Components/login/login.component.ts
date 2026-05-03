import { Component, inject, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

import { Router } from '@angular/router';
import { UserService } from '../../Services/appServices/userServices/user.service';
import { ThemeService } from '../../Services/theme/theme.service';
import { AccesoModuloSistemasService } from '../../Services/appServices/biomedicaServices/backup/acceso-modulo-sistemas.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  formulario: FormGroup;
  userServices = inject(UserService);
  router = inject(Router);
  themeService = inject(ThemeService);
  private accesoModuloSistemasService = inject(AccesoModuloSistemasService);

  constructor(
    private formBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.formulario = new FormGroup({
      usuarion: new FormControl(),
      contraseña: new FormControl()
    });
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    try {
      const response = await this.userServices.login(this.formulario.value);
      if (!response.error) {
        sessionStorage.setItem('utoken', response.token);
        // El cache del módulo de sistemas se asocia al usuario; al iniciar sesión se invalida
        // para que el próximo usuario reciba su propio resultado en lugar del cacheado.
        this.accesoModuloSistemasService.invalidar();
        if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'SYSTEMADMIN') {
          this.router.navigate(['/adminsistemas']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'SYSTEMUSER') {
          this.router.navigate(['/admin/sistemasinformacion/backups']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'SUPERADMIN') {
          this.router.navigate(['/superadmin']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'MANTENIMIENTOADMIN') {
          this.router.navigate(['/adminmantenimiento']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'BIOMEDICAADMIN') {
          this.router.navigate(['/adminbiomedica']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'BIOMEDICAUSER') {
          this.router.navigate(['/userbiomedica']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'BIOMEDICATECNICO') {
          this.router.navigate(['/userbiomedica']);
        } else if (this.getDecodedAccessToken(sessionStorage.getItem('utoken')!).rol === 'MESAUSER') {
          this.router.navigate(['/mesauser/home']);
        }
      }
    } catch {
      Swal.fire({
        icon: 'warning',
        title: 'Usuario o contraseña incorecto',
        text: 'Verifique los campos.'
      })
    }
  }

  async loginInvitado() {
    try {
      const response = await this.userServices.loginInvitado();

      if (response && response.token) {
        sessionStorage.setItem('utoken', response.token);
        sessionStorage.setItem('idUser', response.idUser);
        sessionStorage.setItem('rol', response.rol);

        Swal.fire({
          icon: 'success',
          title: 'Acceso Correcto',
          text: 'Bienvenido Invitado',
        })

        this.router.navigate(['/biomedica/home-invitado']);
      } else {
        console.error('Invalid response:', response);
      }
    } catch (err) {
      console.error('Guest Login Error:', err); // Debug
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo acceder como invitado.',
      })
    }
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }
}
