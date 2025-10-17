import { Component } from '@angular/core';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { RouterModule } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-resumen-compra',
  standalone: true,
  imports: [InfoEvento, RouterModule, CurrencyPipe],
  templateUrl: './resumen-compra.html',
  styleUrls: ['./resumen-compra.css']
})
export class ResumenCompra {
  // Datos estáticos para el resumen de la compra
  resumen = {
    boletos: [
      { nombre: 'PREVENTA VIP FASE 1', cantidad: 2, total: 300 },
      { nombre: 'PREVENTA GENERAL', cantidad: 1, total: 100 }
    ],
    subtotal: 400,
    comision: 40,
    cargoBancario: 15
  };

  get totalGeneral() {
    return this.resumen.subtotal + this.resumen.comision + this.resumen.cargoBancario;
  }
}

