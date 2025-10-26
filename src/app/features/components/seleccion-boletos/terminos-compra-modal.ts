import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EventoDetalle } from '../../models/evento-detalle.model';

@Component({
  selector: 'app-terminos-compra-modal',
  standalone: true,
  imports: [],
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal implements OnChanges {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() evento: EventoDetalle | null = null;
  @Input() dataCliente: null = null;
  @Input() dataEventExtra: any = null;
  boleto: any = {
    "evento": 4,
    "nombre_titular": "",
    "email_titular": "",
    "telefono_titular": "",
    "parametro": "",
    "forma_pago": "tarjeta",
    "tipo_pago": '1',
    "vendido_por": '1',
    "canal_venta": 2,
    "metodo_pago": '3',
    "total": 0,
    "subtotal": 0,
    "comision": 0,
    "info_promo": '',
    "credit": 0,
    "nomina": 0,
    "cambio": 0,
    "efectivo": 0,
    "card": 0,
    "tickets": [

    ],
    "ltsdgt": "",
    "country_id": 142,
    "state_id": 3466,
    "city_id": 72261,
    "postal_code": "",
    "address": ""
  };
  ngOnChanges(changes: SimpleChanges): void {
    console.log('dataEventExtra:', this.dataEventExtra);
    console.log('dataCliente:', this.dataCliente);
    console.log('evento:', this.evento);
    // Si el modal se hace visible, cargamos los eventos

  }
  close() {
    this.closeModal.emit();
  }
  terminos() {
    
  }
}