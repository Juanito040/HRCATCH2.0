import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../Services/appServices/userServices/user.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-homeuser-mesa',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './homeuser-mesa.component.html',
  styleUrl: './homeuser-mesa.component.css'
})
export class HomeuserMesaComponent implements OnInit {

  userName: string = '';
  roleName: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    const token = this.userService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      // Fetch profile to get Service Desk Role Name and Full Name
      this.userService.getUserProfil(decoded.id).then((user: any) => {
        if (user) {
          this.userName = `${user.nombres} ${user.apellidos}`;
          if (user.mesaServicioRol) {
            this.roleName = user.mesaServicioRol.nombre;
          }
        }
      });
    }
  }

  goToCasos() {
    this.router.navigate(['/adminmesaservicios/casos']);
  }

  goToCreate() {
    this.router.navigate(['/adminmesaservicios/casos/novo']);
  }
}
