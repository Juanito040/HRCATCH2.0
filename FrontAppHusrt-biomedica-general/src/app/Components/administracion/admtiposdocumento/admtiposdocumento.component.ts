import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TipoDocumentoService } from '../../../Services/appServices/general/tipoDocumento/tipo-documento.service';
import { getDecodedAccessToken } from '../../../utilidades';

import { UppercaseDirective } from '../../../Directives/uppercase.directive';

@Component({
    selector: 'app-admtiposdocumento',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule,
        IconFieldModule,
        InputIconModule,
        UppercaseDirective
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './admtiposdocumento.component.html',
    styleUrl: './admtiposdocumento.component.css'
})
export class AdmtiposdocumentoComponent implements OnInit {

    @ViewChild('dt') dt!: Table;
    tiposDocumento: any[] = [];
    tipoDocumentoDialog: boolean = false;
    tipoDocumento: any = {};
    submitted: boolean = false;
    loading: boolean = false;
    isAdminBiomedica: boolean = false;

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        this.dt.filterGlobal(input.value, 'contains');
    }

    constructor(
        private tipoDocumentoService: TipoDocumentoService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.checkRole();
        this.getAllTiposDocumento();
    }

    checkRole() {
        const token = sessionStorage.getItem('utoken');
        if (token) {
            const decoded = getDecodedAccessToken();
            if (decoded?.rol === 'BIOMEDICAADMIN') {
                this.isAdminBiomedica = true;
            }
        }
    }

    getAllTiposDocumento() {
        this.loading = true;
        this.tipoDocumentoService.getAllTiposDocumento().then(data => {
            this.tiposDocumento = data;
            this.loading = false;
        }).catch(error => {
            this.loading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los tipos de documento' });
        });
    }

    openNew() {
        this.tipoDocumento = {};
        this.submitted = false;
        this.tipoDocumentoDialog = true;
    }

    editTipoDocumento(tipo: any) {
        this.tipoDocumento = { ...tipo };
        this.tipoDocumentoDialog = true;
    }

    deleteTipoDocumento(tipo: any) {
        this.confirmationService.confirm({
            message: '¿Estás seguro de que quieres eliminar ' + tipo.nombres + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tipoDocumentoService.deleteTipoDocumento(tipo.id).then(() => {
                    this.getAllTiposDocumento();
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Tipo de Documento Eliminado', life: 3000 });
                }).catch(error => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro' });
                });
            }
        });
    }

    hideDialog() {
        this.tipoDocumentoDialog = false;
        this.submitted = false;
    }

    saveTipoDocumento() {
        this.submitted = true;

        if (this.tipoDocumento.nombres?.trim()) {
            if (this.tipoDocumento.id) {
                this.tipoDocumentoService.updateTipoDocumento(this.tipoDocumento.id, this.tipoDocumento).then(() => {
                    this.getAllTiposDocumento();
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Tipo de Documento Actualizado', life: 3000 });
                    this.tipoDocumentoDialog = false;
                    this.tipoDocumento = {};
                }).catch(error => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar' });
                });
            } else {
                this.tipoDocumentoService.addTipoDocumento(this.tipoDocumento).then(() => {
                    this.getAllTiposDocumento();
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Tipo de Documento Creado', life: 3000 });
                    this.tipoDocumentoDialog = false;
                    this.tipoDocumento = {};
                }).catch(error => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear' });
                });
            }
        }
    }
}
