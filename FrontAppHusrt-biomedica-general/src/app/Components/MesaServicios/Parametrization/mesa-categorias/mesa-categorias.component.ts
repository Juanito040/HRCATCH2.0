import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FieldsetModule } from 'primeng/fieldset';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { jwtDecode } from 'jwt-decode';
import { MesaService } from '../../../../Services/mesa-servicios/mesa.service';
import { ServicioService } from '../../../../Services/appServices/general/servicio/servicio.service';

@Component({
  selector: 'app-mesa-categorias',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, ToastModule, ConfirmDialogModule, ToolbarModule, FieldsetModule, TagModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mesa-categorias.component.html',
  styleUrl: './mesa-categorias.component.css'
})
export class MesaCategoriasComponent implements OnInit {

  servicios: any[] = [];
  selectedServicio: any = null;

  categorias: any[] = [];

  // Create Category Dialog
  displayCategoryDialog: boolean = false;
  newCategory: any = { nombre: '', descripcion: '' };

  // Create Subcategory Dialog
  displaySubCategoryDialog: boolean = false;
  selectedCategoriaForSub: any = null;
  newSubCategory: any = { nombre: '', descripcion: '' };

  // Manage Subcategories Dialog
  displaySubManageDialog: boolean = false;
  selectedCategoryForManage: any = null;

  constructor(
    private mesaService: MesaService,
    private servicioService: ServicioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  userRole: string = '';

  ngOnInit() {
    this.extractUser();
    this.loadServicios();
  }

  extractUser() {
    const token = sessionStorage.getItem('utoken');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded.rol;
    }
  }

  loadServicios() {
    this.servicioService.getAllServiciosActivos().then(data => {

      if (Array.isArray(data)) {
        this.servicios = data.filter((s: any) => s.requiereMesaServicios === true);
      } else {
        console.error('Servicios is not an array:', data);
        this.servicios = [];
      }
    });
  }

  onServicioChange() {
    this.selectedCategoryForManage = null;
    this.displaySubManageDialog = false;
    if (this.selectedServicio) {

      this.loadCategorias();
    } else {
      this.categorias = [];
    }
  }

  loadCategorias() {

    this.mesaService.getCategorias(this.selectedServicio.id).subscribe({
      next: (data) => {

        if (Array.isArray(data)) {
          this.categorias = data.map((cat: any) => ({
            ...cat,
            subcategorias: Array.isArray(cat.subcategorias) ? cat.subcategorias : []
          }));
        } else {
          console.error('Categorias data is not an array:', data);
          // Try to handle wrapped response if applicable
          const possibleData = (data as any).data || (data as any).result;
          if (Array.isArray(possibleData)) {
            this.categorias = possibleData.map((cat: any) => ({
              ...cat,
              subcategorias: Array.isArray(cat.subcategorias) ? cat.subcategorias : []
            }));
          } else {
            this.categorias = [];
          }
        }

        // Refresh modal data if open
        if (this.displaySubManageDialog && this.selectedCategoryForManage) {
          const current = this.categorias.find(c => c.id === this.selectedCategoryForManage.id);
          if (current) {
            this.selectedCategoryForManage = current;
          }
        }
      },
      error: (err) => {
        console.error('Error loading categorias:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las categorías' });
      }
    });
  }

  openNewCategory() {
    if (!this.selectedServicio) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un servicio primero' });
      return;
    }
    this.newCategory = { nombre: '', descripcion: '', servicioId: this.selectedServicio.id };
    this.displayCategoryDialog = true;
  }

  saveCategory() {
    if (!this.newCategory.nombre) return;

    this.mesaService.createCategoria(this.newCategory).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada' });
        this.displayCategoryDialog = false;
        this.loadCategorias();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló al crear categoría' });
      }
    });
  }

  openNewSubCategory(categoria: any) {
    this.selectedCategoriaForSub = categoria;
    this.newSubCategory = { nombre: '', descripcion: '', categoriaId: categoria.id };
    this.displaySubCategoryDialog = true;
  }

  saveSubCategory() {
    if (!this.newSubCategory.nombre) return;

    this.mesaService.createSubcategoria(this.newSubCategory).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Subcategoría creada' });
        this.displaySubCategoryDialog = false;
        this.loadCategorias(); // Reload to show new subcat
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló al crear subcategoría' });
      }
    });
  }

  toggleCategoria(categoria: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${categoria.activo ? 'desactivar' : 'activar'} la categoría "${categoria.nombre}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mesaService.toggleCategoria(categoria.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Categoría ${categoria.activo ? 'desactivada' : 'activada'} correctamente` });
            this.loadCategorias();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
          }
        });
      }
    });
  }

  toggleSubcategoria(subcategoria: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea ${subcategoria.activo ? 'desactivar' : 'activar'} la subcategoría "${subcategoria.nombre}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mesaService.toggleSubcategoria(subcategoria.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Subcategoría ${subcategoria.activo ? 'desactivada' : 'activada'} correctamente` });
            this.loadCategorias(); // This will also refresh the modal via the existing logic in loadCategorias
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
          }
        });
      }
    });
  }

  openManageSubcategories(categoria: any) {
    this.selectedCategoryForManage = categoria;
    this.displaySubManageDialog = true;
  }
}
