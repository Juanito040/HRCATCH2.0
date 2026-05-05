import { Component, OnInit } from '@angular/core';
import { ImagingService } from '../../../../Services/Imaging/imaging.service';
import { EntidadService } from '../../../../Services/Servinte/entidad.service';
import Swal from 'sweetalert2';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';



@Component({
  selector: 'app-reportce',
  standalone: true,
  imports: [ReactiveFormsModule, TableModule],
  templateUrl: './reportce.component.html',
  styleUrl: './reportce.component.css'
})
export class ReportceComponent implements OnInit {

  formDate: FormGroup;

  cites!: any[];
  entidad!: any[];

  constructor(
    private imagingService: ImagingService,
    private entidadService: EntidadService,
    private formBuilder: FormBuilder
  ) {
    this.formDate = this.formBuilder.group({
      fechaI: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/
          ),
        ],
      ],
      fechaF: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/
          ),
        ],
      ],
    });
  }

  ngOnInit(): void { }

  async updateCitesDate() {
    for (let index = 0; index < this.cites.length; index++) {
      const element = this.cites[index];
      this.entidad = [];
      if (
        element.Entidad == null ||
        element.EAPB == null ||
        element.Aseguradora == null
      ) {
        if (element.Aseguradora != null && element.Entidad == null) {
          element.Entidad = element.Aseguradora;
        }
        if (element.Aseguradora == null && element.Entidad != null) {
          element.Aseguradora = element.Entidad;
        }
        if (element.EAPB == null) {

          this.entidad = await this.entidadService.getEAPBEntidad(element.Aseguradora);
          if (this.entidad[0] != null) {
            element.EAPB = this.entidad[0].EMPDETADM;
          }
          ;
        }
      }
      if (
        element.Entidad == null &&
        element.EAPB == null &&
        element.Aseguradora == null
      ) {

        this.entidad = await this.entidadService.getentidadPaciente(element.Num_de_Identificacion);
        if (this.entidad[0] != null) {
          element.EAPB = this.entidad[0].EMPCOD;
          element.Entidad = this.entidad[0].EMPNOM;
          element.Aseguradora = this.entidad[0].EMPNOM;
        };

        if (element.Aseguradora != null) {
          if (element.Tipo_Usuario == null) {
            if (
              element.Aseguradora.charAt(element.Aseguradora.length - 1) == 'S'
            ) {
              element.Tipo_Usuario = 'SUBSIDIADO';
            }
            if (
              element.Aseguradora.charAt(element.Aseguradora.length - 1) == 'C'
            ) {
              element.Tipo_Usuario = 'CONTRIBUTIVO';
            } else {
              element.Tipo_Usuario = 'REGIMENES ESPECIALES';
            }
          }
        }
      }
    }
  }

  generateExcel() {
    this.exportAsExcelFile(this.cites, 'ReporteMensual');
  }

  static toExportFileName(excelFileName: string): string {
    return `${excelFileName}_export_${new Date().getTime()}.xlsx`;
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    XLSX.writeFile(workbook, ReportceComponent.toExportFileName(excelFileName));
  }

  filtrarporFecha() {
    if (
      (this.formDate.value.fechaI != null &&
        this.formDate.value.fechaF != null) ||
      (this.formDate.value.fechaI != '' &&
        this.formDate.value.fechaF != '')

    ) {
      if (
        this.compareDatesInput(
          this.formDate.value.fechaI,
          this.formDate.value.fechaF
        )
      ) {
        let obj = {
          fechaI: this.updateDateFormat(this.formDate.value.fechaI) + '',
          fechaF: this.updateDateFormat(this.formDate.value.fechaF) + '',
        };
        this.imagingService.getCitesDate(obj).subscribe((data) => {
          this.cites = data.body;
          this.updateCitesDate();

        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Fechas Invalidas',
          text: 'Los rangos de fechas no son validos para la generacion del reporte.',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacios',
        text: 'Debe seleccionar la fecha de inicio y la fecha final para generar el reporte.',
      });
    }
  }

  updateDateFormat(date: String): String {
    const partes = date.split('-');
    const [año, mes, dia] = partes;
    return dia + '-' + mes + '-' + año;
  }

  compareDatesInput(dateI: String, dateF: String): boolean {
    let dateIN: Date = new Date(dateI + "");
    let dateFN: Date = new Date(dateF + "");
    if (dateIN < dateFN) {
      return true;
    } else {
      return false;
    }
  }
}
