import { AerolineaService } from './../../../Services/aerolinea/aerolinea.service';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-aerolinea',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule],
  templateUrl: './aerolinea.component.html',
  styleUrl: './aerolinea.component.css',
  providers: [MessageService],
})
export class AerolineaComponent {

  visibleQr: boolean = false;
  formGroup: FormGroup;

  constructor(private aerolineaService: AerolineaService, private router: Router, private formBuilder: FormBuilder) {

    this.formGroup = this.formBuilder.group({
      nombre: new FormControl('', [Validators.required]),
      apellido: new FormControl('', [Validators.required]),
      tipoId: new FormControl('', [Validators.required]),
      numeroId: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      areaServicio: new FormControl('', [Validators.required]),
      perfilProfesional: new FormControl('', [Validators.required]),
      tipoVinculo: new FormControl('', [Validators.required])
    })
  }


  async crearPasajero() {
    let obj = {
      nombre: this.formGroup.value.nombre,
      apellido: this.formGroup.value.apellido,
      tipoId: this.formGroup.value.tipoId,
      numeroId: this.formGroup.value.numeroId,
      email: this.formGroup.value.email,
      areaServicio: this.formGroup.value.areaServicio,
      perfilProfesional: this.formGroup.value.perfilProfesional,
      tipoVinculo: this.formGroup.value.tipoVinculo,
      rutaFirma: " ",
      rutaQr: " "
    }



    try {
      const user = await this.aerolineaService.addUser(obj);
      if (!user.error) {
        Swal.fire({
          icon: 'success',
          title: 'Se creo un nuevo pasajero.',
          text: 'creado exitosamente',
          confirmButtonText: 'Descargar Ticket'
        }).then((result) => {
          if (result.isConfirmed) {
            this.downloadTicket(obj)
            Swal.fire(
              '¡Ticket creado!',
              'Se ha descargado su Ticket.',
              'success'
            );
          }
        });
        //this.downloadTicket(obj)
        //this.visibleQr = true;

      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No fue posible guardar el pasajero',
          text: 'Existe una inconsistencia en los datos'
        })
      }
    } catch {
      Swal.fire({
        icon: 'warning',
        title: 'No fue posible guardar el pasajero',
        text: 'ERROR DEL SISTEMA'
      })
    }

  }

  reloadpage() {
    window.location.reload()
    this.visibleQr = false;
  }

  downloadTicket(data: any) {
    this.aerolineaService.downloadPdf(data).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.nombre + data.apellido + data.numeroId + '.pdf'; // Nombre del archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
}
