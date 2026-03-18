import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MesaService } from '../../../../Services/mesa-servicios/mesa.service';
import { ServicioService } from '../../../../Services/appServices/general/servicio/servicio.service';
import { UserService } from '../../../../Services/appServices/userServices/user.service';
import { MenuItem } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
  selector: 'app-mesa-casos-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, SelectModule,
    CalendarModule, TagModule, TooltipModule, ToolbarModule, FieldsetModule, DialogModule, InputTextModule,
    MenuModule,
    AutoCompleteModule, ConfirmDialogModule, IconFieldModule, InputIconModule,
    UppercaseDirective
  ],
  providers: [ConfirmationService],
  templateUrl: './mesa-casos-list.component.html',
  styleUrl: './mesa-casos-list.component.css'
})
export class MesaCasosListComponent implements OnInit {

  casos: any[] = [];
  servicios: any[] = [];

  estados = [
    { label: 'Abiertos', value: 'ABIERTOS' },
    { label: 'Todos', value: null },
    { label: 'Nuevo', value: 'NUEVO' },
    { label: 'En Curso', value: 'EN_CURSO' },
    { label: 'En Espera', value: 'EN_ESPERA' },
    { label: 'Resuelto', value: 'RESUELTO' },
    { label: 'Cerrado', value: 'CERRADO' }
  ];

  // Filters
  selectedServicio: any = null;
  selectedEstado: any = this.estados[0]; // Default to Abiertos
  selectedTipo: any = null;
  selectedSumerce: any = null;
  selectedId: any = null;


  tipos = [
    { label: 'Todos', value: null },
    { label: 'Incidencia', value: 'INCIDENCIA' },
    { label: 'Requerimiento', value: 'REQUERIMIENTO' }
  ];

  sumerceOptions = [
    { label: 'Todos', value: null },
    { label: 'S - Seguro', value: 'S_SEGURO' },
    { label: 'U - Universitario', value: 'U_UNIVERSITARIO' },
    { label: 'M - Mejorado', value: 'M_MEJORADO' },
    { label: 'E - Eficiente', value: 'E_EFICIENTE' },
    { label: 'R - Responsable', value: 'R_RESPONSABLE' },
    { label: 'C - Cálido', value: 'C_CALIDO' },
    { label: 'E - Excelente', value: 'E_EXCELENTE' }
  ];

  loading: boolean = false;

  @ViewChild('dtCasos') dtCasos!: any;

  constructor(
    private mesaService: MesaService,
    private servicioService: ServicioService,
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.loadUserProfile();
    this.loadServicios();
    this.loadCasos();
  }

  loadServicios() {
    this.servicioService.getAllServiciosActivos().then(data => {
      if (Array.isArray(data)) {
        // Filter for Mesa de Servicios
        const serviciosMesa = data.filter((s: any) => s.requiereMesaServicios === true);
        this.servicios = [{ nombres: 'Todos', id: null }, ...serviciosMesa];
      } else {
        this.servicios = [{ nombres: 'Todos', id: null }];
      }
    }).catch(err => {
      console.error('Error loading servicios:', err);
    });
  }

  loadCasos() {
    this.loading = true;
    const filters: any = {};
    if (this.selectedId) filters.id = this.selectedId;
    if (this.selectedServicio?.id) filters.servicioId = this.selectedServicio.id;
    if (this.selectedEstado?.value) filters.estado = this.selectedEstado.value;
    if (this.selectedTipo?.value) filters.tipo = this.selectedTipo.value;
    if (this.selectedSumerce?.value) filters.sumerce = this.selectedSumerce.value;

    this.mesaService.getCasos(filters).subscribe({
      next: (data) => {
        this.casos = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target && this.dtCasos) {
      this.dtCasos.filterGlobal(target.value, 'contains');
    }
  }

  clearFilters() {
    this.selectedId = null;
    this.selectedServicio = { nombres: 'Todos', id: null };
    this.selectedEstado = this.estados[1]; // Todos
    this.selectedTipo = { label: 'Todos', value: null };
    this.selectedSumerce = { label: 'Todos', value: null };
    if (this.dtCasos) {
      this.dtCasos.clear();
    }
    const globalSearchInput = document.querySelector('input[placeholder*="Búsqueda General"]') as HTMLInputElement;
    if (globalSearchInput) {
      globalSearchInput.value = '';
    }
    this.loadCasos();
  }

  viewCaso(id: number) {
    this.router.navigate(['/adminmesaservicios/casos', id]);
  }

  createNew() {
    this.router.navigate(['/adminmesaservicios/casos/novo']);
  }


  // Menu
  menuItems: MenuItem[] = [];
  selectedCaseForMenu: any = null;

  setMenuCase(caso: any) {
    this.selectedCaseForMenu = caso;
    this.menuItems = [
      {
        label: 'Ver Detalle',
        icon: 'pi pi-eye',
        command: () => this.viewCaso(caso.id)
      }
    ];

    if (this.canEdit(caso)) {
      this.menuItems.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.openAdminEdit(caso)
      });
    }

    if (this.canAssign(caso)) {
      this.menuItems.push({
        label: 'Asignar',
        icon: 'pi pi-user-plus',
        command: () => this.openAssignDialog(caso)
      });
    }
  }

  getSeverity(estado: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (estado) {
      case 'NUEVO': return 'info';
      case 'EN_CURSO': return 'warning';
      case 'EN_ESPERA': return 'secondary';
      case 'RESUELTO': return 'success';
      case 'CERRADO': return 'contrast';
      default: return 'info';
    }
  }

  getPrioritySeverity(prioridad: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (prioridad) {
      case 'CRITICA': return 'danger';
      case 'ALTA': return 'warning';
      case 'MEDIA': return 'info';
      case 'BAJA': return 'success'; // Or secondary/info
      default: return 'info';
    }
  }

  // Admin Edit Section
  displayAdminDialog: boolean = false;
  editingCaso: any = null;
  adminForm: any = {
    prioridad: null,
    sumerce: null,
    servicioId: null
  };

  prioridades = [
    { label: 'Critica', value: 'CRITICA' },
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja', value: 'BAJA' }
  ];

  userRoleCode: string = '';
  userServiceId: number = 0;
  userId: number = 0;
  userRole: string = '';
  isMesaUser: boolean = false;

  checkSuperAdmin(): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    const token = sessionStorage.getItem('utoken');
    if (!token) return false;
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      return decoded.rol === 'SUPERADMIN';
    } catch {
      return false;
    }
  }

  loadUserProfile() {
    if (typeof sessionStorage === 'undefined') return;
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      this.userId = decoded.id;
      this.userRole = decoded.rol;
      this.isMesaUser = decoded.rol === 'MESAUSER';

      // Fetch full profile for Mesa Role
      this.userService.getUserProfil(this.userId).then(user => {
        if (user && user.mesaServicioRol) {
          this.userRoleCode = user.mesaServicioRol.codigo;
          this.userServiceId = user.servicioId;
        }
      });
    }
  }

  canEdit(caso: any): boolean {
    if (caso.estado === 'CERRADO') return false;
    // Strict requirement: Only SUPERADMIN can edit the case details (List View)
    return this.checkSuperAdmin();
  }

  openAdminEdit(caso: any) {
    this.editingCaso = caso;
    this.adminForm = {
      prioridad: caso.prioridad,
      sumerce: caso.sumerce,
      servicioId: caso.servicioId
    };
    this.displayAdminDialog = true;
  }

  // Assignment
  displayAssignDialog: boolean = false;
  assigningCaso: any = null;
  usersService: any[] = [];
  selectedResolutor: any = null; // Can be single object or array
  filteredUsers: any[] = [];

  filterUsers(event: any) {
    const query = event.query.toLowerCase();
    this.filteredUsers = this.usersService.filter(user =>
      user.nombres.toLowerCase().includes(query) ||
      user.apellidos.toLowerCase().includes(query) ||
      (user.mesaServicioRol?.nombre && user.mesaServicioRol.nombre.toLowerCase().includes(query))
    );
  }

  canAssign(caso: any): boolean {
    if (caso.estado === 'CERRADO') return false;
    if (this.checkSuperAdmin()) return true;

    // Admin, Agent, Resolutor of the same service
    if (['ADMIN_SERVICIO', 'ADMINISTRADOR', 'RESOLUTOR', 'AGENTE', 'ADM', 'AG'].includes(this.userRoleCode) && this.userServiceId === caso.servicio?.id) {
      return true;
    }
    return false;
  }

  openAssignDialog(caso: any) {
    this.assigningCaso = caso;
    this.selectedResolutor = null;

    // Fetch users for the service of the case
    if (caso.servicioId) {
      this.mesaService.getUsersByServicio(caso.servicioId).subscribe({
        next: (data: any[]) => {
          // Filter users: Role (Admin/Agent) AND Active
          this.usersService = data.filter(user => {
            const roleName = user.mesaServicioRol?.nombre;
            const isActive = user.estado;
            return (roleName === 'ADMINISTRADOR' || roleName === 'AGENTE') && isActive === true;
          });
          this.displayAssignDialog = true;
        },
        error: (err) => {
          console.error('Error fetching users', err);
        }
      });
    }
  }

  confirmAssign() {
    if (!this.assigningCaso || !this.selectedResolutor) return;

    this.confirmationService.confirm({
      message: '¿Está seguro de asignar este(os) responsable(s) al caso?',
      header: 'Confirmar Asignación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let userId = 0;
        const token = sessionStorage.getItem('utoken');
        if (token) {
          const decoded: any = JSON.parse(atob(token.split('.')[1]));
          userId = decoded.id;
        }

        // Handle multiple selection (array) or single (object)
        let resolutorsToAssign = [];
        if (Array.isArray(this.selectedResolutor)) {
          resolutorsToAssign = this.selectedResolutor;
        } else {
          resolutorsToAssign = [this.selectedResolutor];
        }

        if (resolutorsToAssign.length === 0) return;

        let completed = 0;
        let errors = 0;

        const finalize = () => {
          if (completed + errors === resolutorsToAssign.length) {
            this.displayAssignDialog = false;
            this.assigningCaso = null;
            this.selectedResolutor = null;
            this.loadCasos();
          }
        };

        resolutorsToAssign.forEach((user: any) => {
          const payload = {
            usuarioId: user.id,
            asignadoPor: userId
          };

          this.mesaService.assignResolutor(this.assigningCaso.id, payload).subscribe({
            next: () => {
              completed++;
              finalize();
            },
            error: (err) => {
              console.error('Error assigning', err);
              errors++;
              finalize();
            }
          });
        });
      }
    });
  }

  saveAdminEdit() {
    if (!this.editingCaso) return;

    // Get current user ID
    let userId = 0;
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      userId = decoded.id;
    }

    const payload = {
      ...this.adminForm,
      usuarioId: userId
    };

    this.mesaService.updateCasoDetails(this.editingCaso.id, payload).subscribe({
      next: () => {
        this.displayAdminDialog = false;
        this.loadCasos();
        // Optional: Show success toast if MessageService was injected, but simplified here
      },
      error: (err) => {
        console.error('Error updating case', err);
      }
    });

  }
}
// Re-compilation trigger
