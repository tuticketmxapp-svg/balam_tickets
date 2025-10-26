import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EventoDetalle } from '../../models/evento-detalle.model';

@Component({
  selector: 'app-terminos-compra-modal',
  standalone: true,
  imports: [],
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal implements OnChanges{
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() evento: EventoDetalle | null = null;
  @Input() dataCliente: null = null;
    ngOnChanges(changes: SimpleChanges): void {
    console.log('this.evento en terminos y condiciones',this.evento);
    console.log('this.dataCliente en terminos y condiciones',this.dataCliente);
    // Si el modal se hace visible, cargamos los eventos
   
  }
  close() {
    this.closeModal.emit();
  }
  terminos(){}
}