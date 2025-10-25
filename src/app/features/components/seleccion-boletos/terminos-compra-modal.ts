import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-terminos-compra-modal',
  standalone: true,
  imports: [],
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
  terminos(){}
}