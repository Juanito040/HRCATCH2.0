import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../Services/appServices/userServices/user.service';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SignaturePad, SignaturePadModule } from 'angular2-signaturepad';
import { FirmaService } from '../../Services/appServices/biomedicaServices/firma/firma.service';

import { UppercaseDirective } from '../../Directives/uppercase.directive';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    FormsModule, CommonModule, CardModule, InputTextModule, PasswordModule,
    ButtonModule, SelectModule, DividerModule, IconFieldModule, InputIconModule,
    DialogModule, SignaturePadModule, UppercaseDirective
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit {

  usuarioServices = inject(UserService);
  firmaService = inject(FirmaService);
  usuario!: any;

  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // Firma Variables
  mostrarFirmaModal: boolean = false;
  firmaUrl: any = null;
  @ViewChild(SignaturePad) signaturePad!: SignaturePad;
  signaturePadOptions: Object = {
    'minWidth': 1,
    'canvasWidth': 500,
    'canvasHeight': 300,
  };

  // Password Variables
  mostrarPasswordModal: boolean = false;

  constructor(private location: Location) { }

  async ngOnInit() {
    try {
      this.usuario = await this.usuarioServices.getUserProfil(this.getDecodedAccessToken(sessionStorage.getItem('utoken') + "").id);
      if (this.usuario) {
        delete this.usuario.contraseña; // No enviar la contraseña cifrada de vuelta al backend si no se cambia
      }
      this.cargarFirma();
    } catch {

    }
  }

  async cargarFirma() {
    if (this.usuario && this.usuario.id) {
      try {
        const blob = await this.firmaService.getFirmaImage(this.usuario.id);
        if (blob) {
          this.firmaUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        // No firm signature found or error loading, silent fail or log

      }
    }
  }

  validarContrasena(contrasena: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/;
    return regex.test(contrasena);
  }

  abrirModalPassword() {
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
    this.mostrarPasswordModal = true;
  }

  cerrarModalPassword() {
    this.mostrarPasswordModal = false;
  }

  aplicarPassword() {
    if (!this.nuevaContrasena || !this.confirmarContrasena) {
      Swal.fire('Error', 'Debe diligenciar ambos campos', 'error');
      return;
    }

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    if (!this.validarContrasena(this.nuevaContrasena)) {
      Swal.fire('Error', 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.', 'error');
      return;
    }

    this.usuario.contraseña = this.nuevaContrasena;
    this.cerrarModalPassword();
    Swal.fire('Éxito', 'Contraseña configurada. Guarde los cambios para aplicar.', 'success');
  }

  async guardarCambios() {
    Swal.fire({
      title: "¿Desea guardar los cambios?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: `Descartar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.usuarioServices.update(this.usuario, this.usuario.id);
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Usuario Actualizado",
            showConfirmButton: false,
            timer: 1500
          });
          this.location.back();
        } catch (error) {
          console.error('Error al actualizar usuario:', error);
          Swal.fire("Error", "No se pudo actualizar la información del usuario", "error");
        }
      } else if (result.isDenied) {
        Swal.fire("Cancelado", "", "info");
      }
    });
  }

  cancelarEdicion() {
    Swal.fire({
      icon: 'info',
      title: 'Operación cancelada',
      text: 'No se realizaron cambios en el perfil.',
      timer: 1500,
      showConfirmButton: false
    });
    this.location.back();
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  // Métodos Firma
  abrirModalFirma() {
    this.mostrarFirmaModal = true;
  }

  cerrarModalFirma() {
    this.mostrarFirmaModal = false;
  }

  limpiarFirma() {
    this.signaturePad.clear();
  }

  // Hook para resizing si fuera necesario
  ngAfterViewInit() {
    // this.signaturePad.set('minWidth', 5);
    // this.signaturePad.clear();
  }

  async guardarFirma() {
    if (this.signaturePad.isEmpty()) {
      Swal.fire('Atención', 'Por favor realice su firma.', 'warning');
      return;
    }

    const firmaBase64 = this.signaturePad.toDataURL(); // PNG por defecto

    try {
      await this.firmaService.guardarFirma(firmaBase64, this.usuario.id);
      Swal.fire({
        icon: 'success',
        title: 'Firma Registrada',
        text: 'Su firma ha sido guardada exitosamente.',
        showConfirmButton: false,
        timer: 1500
      });
      this.cerrarModalFirma();
      this.cargarFirma();
    } catch (error) {
      console.error('Error guardando firma:', error);
      Swal.fire('Error', 'No se pudo guardar la firma.', 'error');
    }
  }
}
