import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { EntidadService } from '../../Services/Servinte/entidad.service';
import { TableModule } from "primeng/table";
import { CommonModule } from '@angular/common';
import { Card } from "primeng/card";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-cirugia',
  imports: [TableModule, CommonModule, Dialog],
  templateUrl: './cirugia.component.html',
  styleUrl: './cirugia.component.css'
})
export class CirugiaComponent implements OnInit {

  pacientes: any[] = [];
  servinteServices = inject(EntidadService);
  visibleSearch: boolean = false;
  vistaPacientes: boolean = false;

  async ngOnInit() {
  }

  async inicierPacientes() {
    const pacientesC = await this.servinteServices.getPacientesCirugia();

    for (let i = 0; i < pacientesC.length; i++) {
      const datosCirugia = await this.servinteServices.getDatosCirugiaPaciente(pacientesC[i].episodio);
      this.pacientes.push({
        datosPaciente: pacientesC[i],
        datosCirugia: datosCirugia[0]
      });
    }

    this.vistaPacientes = true;
    setTimeout(() => {
      this.pacientes = [];
      this.inicierPacientes();
    }, 60000);
  }
}
