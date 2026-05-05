
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-invitado',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './home-invitado.component.html',
    styleUrl: './home-invitado.component.css'
})
export class HomeInvitadoComponent implements OnInit {

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    showViewSedes() {
        this.router.navigate(['biomedica/sedes']);
    }
}
