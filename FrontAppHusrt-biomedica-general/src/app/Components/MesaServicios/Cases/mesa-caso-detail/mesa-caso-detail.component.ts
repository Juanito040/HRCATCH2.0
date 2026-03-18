import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { jwtDecode } from 'jwt-decode';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MesaService } from '../../../../Services/mesa-servicios/mesa.service';
import { UserService } from '../../../../Services/appServices/userServices/user.service';

import { ChipModule } from 'primeng/chip';
import { EditorModule } from 'primeng/editor';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { API_URL } from '../../../../constantes';

@Component({
  selector: 'app-mesa-caso-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule, TextareaModule,
    TagModule, PanelModule, DialogModule, RatingModule, ToastModule, ConfirmDialogModule,
    FileUploadModule, SelectModule, ChipModule, RouterModule, EditorModule, ImageModule, TooltipModule,
    AutoCompleteModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mesa-caso-detail.component.html',
  styleUrl: './mesa-caso-detail.component.css'
})
export class MesaCasoDetailComponent implements OnInit {

  apiUrl = API_URL;
  casoId: number = 0;
  caso: any = null;
  userId: number = 0;

  newMessage: string = '';
  uploadedFiles: any[] = []; // Store selected files

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  // Close Case Dialog
  displayCloseDialog: boolean = false;
  cierreMensaje: string = '';
  uploadedCloseFiles: any[] = [];

  onUploadClose(event: any) {
    for (let file of event.files) {
      this.uploadedCloseFiles.push(file);
    }
  }

  // Rating Dialog
  displayRatingDialog: boolean = false;
  ratingValue: number = 0;
  ratingComment: string = '';

  // Assignment Dialog
  displayAssignDialog: boolean = false;
  usersService: any[] = [];
  selectedResolutor: any = null; // Can be single object or array if multiple="true"
  filteredUsers: any[] = [];

  filterUsers(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUsers = this.usersService.filter(user =>
      user.nombres.toLowerCase().includes(query) ||
      user.apellidos.toLowerCase().includes(query) ||
      (user.mesaServicioRol?.nombre && user.mesaServicioRol.nombre.toLowerCase().includes(query))
    );
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mesaService: MesaService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  userRole: string = '';

  ngOnInit() {
    this.extractUser();
    this.route.params.subscribe(params => {
      this.casoId = +params['id'];
      this.loadCaso();
    });
  }

  userRoleCode: string = '';
  userServiceId: number = 0;

  extractUser() {
    const token = this.userService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = decoded.id;
      this.userRole = decoded.rol;

      this.userService.getUserProfil(this.userId).then(user => {
        if (user && user.mesaServicioRol) {
          this.userRoleCode = user.mesaServicioRol.codigo;
          this.userServiceId = user.servicioId;
        }
      });
    }
  }

  canAssign(): boolean {
    if (!this.caso) return false;
    // Admin or Agent of the service
    // 'ADM' is the role name for ID 1. 'AGENTE' for ID 3.
    const hasRole = ['ADMINISTRADOR', 'ADMIN_SERVICIO', 'RESOLUTOR', 'AGENTE', 'ADM', 'AG'].includes(this.userRoleCode);
    const sameService = this.userServiceId === (this.caso.servicioId || this.caso.servicio?.id);

    if (hasRole && sameService) {
      return true;
    }
    // SuperAdmin
    const token = this.userService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      if (decoded.rol === 'SUPERADMIN') return true;
    }
    return false;
  }

  canClose(): boolean {
    if (!this.caso || this.caso.estado === 'CERRADO') return false;
    if (this.canAssign()) return true; // Admin/Agent can close
    // Creator can close? Prompt didn't specify, but often they can. I'll stick to Admin/Agent per "Solicitante ... enviar mensajes ... no puede editarlos/asignarlos"
    return false;
  }

  loadCaso() {
    this.mesaService.getCasoById(this.casoId).subscribe({
      next: (data) => {
        this.caso = data;

        // Treat Description as the first message
        if (this.caso.descripcion) {
          const descriptionMsg = {
            id: 'DESC', // Pseudo ID
            mensaje: this.caso.descripcion,
            fecha: this.caso.fechaCreacion,
            usuarioId: this.caso.creadorId, // Creator ID
            usuario: this.caso.creador,
            tipo: 'DESCRIPCION'
          };
          if (!this.caso.mensajes) this.caso.mensajes = [];
          this.caso.mensajes.unshift(descriptionMsg);
        }

        // Sort messages
        if (this.caso.mensajes) {
          this.caso.mensajes.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el caso' });
      }
    });
  }

  sendMessage() {
    if ((!this.newMessage || !this.newMessage.trim()) && this.uploadedFiles.length === 0) return;

    this.confirmationService.confirm({
      message: '¿Está seguro de enviar este mensaje?',
      header: 'Confirmar Envío',
      icon: 'pi pi-question-circle',
      accept: () => {
        const formData = new FormData();
        formData.append('usuarioId', this.userId.toString());
        formData.append('mensaje', this.newMessage);
        formData.append('tipo', 'NORMAL');

        // Append files
        if (this.uploadedFiles && this.uploadedFiles.length > 0) {
          for (let file of this.uploadedFiles) {
            formData.append('archivos', file);
          }
        }

        this.mesaService.addMensaje(this.casoId, formData).subscribe({
          next: (res) => {
            this.newMessage = '';
            this.uploadedFiles = []; // Clear files
            this.loadCaso(); // Reload to see new message
            this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Mensaje enviado correctamente' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló el envío' });
          }
        });
      }
    });
  }

  openCloseDialog() {
    this.cierreMensaje = '';
    this.uploadedCloseFiles = [];
    this.displayCloseDialog = true;
  }

  confirmClose() {
    if (!this.cierreMensaje.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Requerido', detail: 'Debe ingresar un mensaje de cierre y solución' });
      return;
    }

    const formData = new FormData();
    formData.append('usuarioId', this.userId.toString());
    formData.append('mensajeFinal', this.cierreMensaje);

    // Append files
    if (this.uploadedCloseFiles && this.uploadedCloseFiles.length > 0) {
      for (let file of this.uploadedCloseFiles) {
        formData.append('archivos', file);
      }
    }

    this.mesaService.closeCaso(this.casoId, formData).subscribe({
      next: (res) => {
        this.displayCloseDialog = false;
        this.cierreMensaje = '';
        this.uploadedCloseFiles = [];
        this.messageService.add({ severity: 'success', summary: 'Cerrado', detail: 'Caso cerrado exitosamente' });
        this.loadCaso();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar el caso' });
      }
    });
  }

  openAssignDialog() {
    // Load Resolutors for this service
    const serviceId = this.caso.servicioId || this.caso.servicio?.id;
    if (this.caso && serviceId) {
      this.mesaService.getUsersByServicio(serviceId).subscribe((data: any[]) => {

        // Show all users in the service (User requested to just bring users related to the service)
        // We keep the role display in the dropdown so they can distinguish.
        this.usersService = data.filter(user => {
          const roleName = user.mesaServicioRol?.nombre;
          const isActive = user.estado;
          return (roleName === 'ADMINISTRADOR' || roleName === 'AGENTE') && isActive === true;
        });
        this.displayAssignDialog = true;
      });
    }
  }

  confirmAssign() {
    if (!this.selectedResolutor) return;

    this.confirmationService.confirm({
      message: '¿Está seguro de asignar este(os) responsable(s) al caso?',
      header: 'Confirmar Asignación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Handle multiple selection (array) or single (object)
        let resolutorsToAssign = [];
        if (Array.isArray(this.selectedResolutor)) {
          resolutorsToAssign = this.selectedResolutor;
        } else {
          resolutorsToAssign = [this.selectedResolutor];
        }

        if (resolutorsToAssign.length === 0) return;

        // We will assume we assign sequentially or just the first one if the API is strict.
        // However, for better UX with multiple support, let's iterate.
        let completed = 0;
        let errors = 0;

        const finalize = () => {
          if (completed + errors === resolutorsToAssign.length) {
            this.displayAssignDialog = false;
            this.selectedResolutor = null;
            if (errors === 0) {
              this.messageService.add({ severity: 'success', summary: 'Asignado', detail: 'Resolutores asignados correctamente' });
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Completado con advertencias', detail: `${completed} asignados, ${errors} fallidos` });
            }
            this.loadCaso();
          }
        };

        resolutorsToAssign.forEach((user: any) => {
          const payload = {
            usuarioId: user.id,
            asignadoPor: this.userId
          };

          this.mesaService.assignResolutor(this.casoId, payload).subscribe({
            next: (res) => {
              completed++;
              finalize();
            },
            error: (err) => {
              console.error('Assign Error', err);
              errors++;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo asignar a ${user.nombres}` });
              finalize();
            }
          });
        });
      }
    });
  }

  removeResolutor(usuarioId: number) {
    if (!usuarioId) return;

    this.confirmationService.confirm({
      message: '¿Está seguro de quitar a este resolutor del caso?',
      header: 'Confirmar Desasignación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const payload = {
          usuarioId: usuarioId,
          desasignadoPor: this.userId
        };

        this.mesaService.removeResolutor(this.casoId, payload).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Desasignado', detail: 'Resolutor eliminado del caso' });
            this.loadCaso();
          },
          error: (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al desasignar' });
          }
        });
      }
    });
  }
}
