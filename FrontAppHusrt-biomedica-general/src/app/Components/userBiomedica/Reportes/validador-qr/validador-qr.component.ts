import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-validador-qr',
  imports: [ZXingScannerModule, CommonModule, FormsModule],
  templateUrl: './validador-qr.component.html',
  styleUrl: './validador-qr.component.css'
})

export class ValidadorQRComponent {

  qrResult: string | null = null;
  devices: MediaDeviceInfo[] = [];
  deviceSelected?: MediaDeviceInfo;

  onCodeResult(result: string) {
    this.qrResult = result;

  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    this.devices = devices;
    if (devices.length > 0) this.deviceSelected = devices[0];
  }
}
