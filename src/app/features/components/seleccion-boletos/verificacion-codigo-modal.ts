import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-verificacion-codigo-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verificacion-codigo-modal.html',
  styleUrls: ['./verificacion-codigo-modal.css']
})
export class VerificacionCodigoModalComponent {
  @Input() isVisible = false;
  @Input() mensaje: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() validarCodigo = new EventEmitter<string>();

  codigo: string = '';

  onClose() {
    this.close.emit();
  }

  onValidar() {
    this.validarCodigo.emit(this.codigo);
  }
  
}
