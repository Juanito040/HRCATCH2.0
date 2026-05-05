import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { MesaService } from '../../../../Services/mesa-servicios/mesa.service';
import { ServicioService } from '../../../../Services/appServices/general/servicio/servicio.service';
import { UserService } from '../../../../Services/appServices/userServices/user.service';
import { SysequiposService, SysEquipo } from '../../../../Services/appServices/sistemasServices/sysequipos/sysequipos.service';
import { jwtDecode } from 'jwt-decode';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { UppercaseDirective } from '../../../../Directives/uppercase.directive';

@Component({
  selector: 'app-mesa-caso-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TextareaModule, SelectModule, ToastModule, FieldsetModule,
    EditorModule, FileUploadModule, UppercaseDirective,
    IconFieldModule, InputIconModule, RouterModule
  ],
  providers: [MessageService],
  templateUrl: './mesa-caso-create.component.html',
  styleUrl: './mesa-caso-create.component.css'
})
export class MesaCasoCreateComponent implements OnInit {

  caso: any = {
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    tipo: 'INCIDENCIA'
  };

  servicios: any[] = [];
  categorias: any[] = [];
  subcategorias: any[] = [];
  equipos: (SysEquipo & { labelEquipo: string })[] = [];

  // Selections
  selectedServicio: any = null;
  selectedCategoria: any = null;
  selectedSubcategoria: any = null;
  selectedSumerce: any = null;
  selectedEquipo: (SysEquipo & { labelEquipo: string }) | null = null;

  uploadedFiles: any[] = []; // Store selected files

  tipos = [
    { label: 'Incidencia', value: 'INCIDENCIA' },
    { label: 'Requerimiento', value: 'REQUERIMIENTO' }
  ];

  prioridades = [
    { label: 'Baja', value: 'BAJA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' },
    { label: 'Crítica', value: 'CRITICA' }
  ];

  sumerceOptions = [
    { label: 'S - Seguro', value: 'S_SEGURO' },
    { label: 'U - Universitario', value: 'U_UNIVERSITARIO' },
    { label: 'M - Mejorado', value: 'M_MEJORADO' },
    { label: 'E - Eficiente', value: 'E_EFICIENTE' },
    { label: 'R - Responsable', value: 'R_RESPONSABLE' },
    { label: 'C - Cálido', value: 'C_CALIDO' },
    { label: 'E - Excelente', value: 'E_EXCELENTE' }
  ];

  userId: number = 0;
  userRole: string = '';

  constructor(
    private mesaService: MesaService,
    private servicioService: ServicioService,
    private userService: UserService,
    private sysequiposService: SysequiposService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.extractUser();
    this.loadServicios();
    this.loadEquipos();
  }

  loadEquipos() {
    this.sysequiposService.getEquipos({ activo: true }).subscribe({
      next: (res) => {
        const lista: SysEquipo[] = Array.isArray(res?.data) ? res.data as SysEquipo[] : [];
        this.equipos = lista.map(e => ({
          ...e,
          labelEquipo: e.placa_inventario
            ? `${e.nombre_equipo} · ${e.placa_inventario}`
            : e.nombre_equipo
        }));
      },
      error: () => {
        this.equipos = [];
      }
    });
  }

  extractUser() {
    const token = this.userService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = decoded.id; // Assuming payload has id
      this.userRole = decoded.rol;
    }
  }

  loadServicios() {
    this.servicioService.getAllServiciosActivos().then(data => {
      this.servicios = data.filter((s: any) => s.requiereMesaServicios === true);
    });
  }

  onServicioChange() {
    if (this.selectedServicio) {
      this.mesaService.getCategorias(this.selectedServicio.id, true).subscribe(data => {
        this.categorias = data;
        this.selectedCategoria = null;
        this.selectedSubcategoria = null;
        this.subcategorias = [];
      });
    } else {
      this.categorias = [];
    }
  }

  onCategoriaChange() {
    if (this.selectedCategoria) {
      this.subcategorias = this.selectedCategoria.subcategorias || [];
      this.selectedSubcategoria = null;
    } else {
      this.subcategorias = [];
    }
  }

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  submit() {
    if (!this.caso.titulo || !this.selectedServicio || !this.selectedCategoria || !this.selectedSubcategoria || !this.selectedSumerce) {
      this.messageService.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Complete todos los campos obligatorios' });
      return;
    }

    if (!this.caso.descripcion || this.caso.descripcion.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Descripción requerida', detail: 'Por favor ingrese una descripción detallada' });
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.caso.titulo);
    formData.append('descripcion', this.caso.descripcion);
    formData.append('prioridad', this.caso.prioridad || 'MEDIA');
    formData.append('tipo', this.caso.tipo || 'INCIDENCIA');
    formData.append('servicioId', this.selectedServicio.id);
    formData.append('sedeId', (this.selectedServicio.sedeIdFk || 1).toString());
    formData.append('categoriaId', this.selectedCategoria.id);
    formData.append('subcategoriaId', this.selectedSubcategoria.id);
    formData.append('sumerce', this.selectedSumerce.value);
    formData.append('creadorId', this.userId.toString());

    if (this.selectedEquipo?.id_sysequipo != null) {
      formData.append('equipoId', this.selectedEquipo.id_sysequipo.toString());
    }

    // Append files
    if (this.uploadedFiles && this.uploadedFiles.length > 0) {
      for (let file of this.uploadedFiles) {
        formData.append('archivos', file);
      }
    }

    this.mesaService.createCaso(formData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Caso creado con éxito' });
        setTimeout(() => {
          this.router.navigate(['/adminmesaservicios/casos']);
        }, 1500);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el caso' });
      }
    });
  }
}
