import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EventoDetalle } from '../../models/evento-detalle.model';
import { RouterModule } from '@angular/router';
import { SHome } from '../../services/shome';
import { Evento } from '../../models/Ievento';

@Component({
  selector: 'app-resumen-compra-modal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './resumen-compra-modal.html',
  styleUrls: ['./resumen-compra-modal.css', '../seleccion-boletos/terminos-compra-modal.css']
})
export class ResumenCompraModal implements OnChanges {
  @Input() isVisible = false;
  @Input() evento: EventoDetalle | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Input() dataCliente: EventoDetalle | null = null;
  @Output() datosEventosExtra = new EventEmitter<any>();
  isTerminosModalVisible = false;
  private sHome = inject(SHome);
  private cdr = inject(ChangeDetectorRef);

  todosLosEventos: Evento[] = [];
  cargando = true;
  eventosSeleccionados: any[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    // Si el modal se hace visible, cargamos los eventos
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.cargarEventos();
    }
  }

  cargarEventos(): void {
    this.cargando = true;
    this.sHome.getEventos().subscribe(eventos => {
      this.todosLosEventos = eventos;
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  esEventoActual(eventoDeLista: Evento): boolean {
    return this.evento?.id === eventoDeLista.id;
  }

  close(): void {
    this.closeModal.emit();
  }
  registrarYVolver(): void {
    this.datosEventosExtra.emit(this.eventosSeleccionados);
     this.isTerminosModalVisible = true;
   setTimeout(() => this.confirm.emit(), 0);
  }
  toggleEventoSeleccionado(item: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      // Agregar si no está ya
      if (!this.eventosSeleccionados.some(ev => ev.id === item.id)) {
        this.eventosSeleccionados.push(item);
      }
    } else {
      // Eliminar si se deselecciona
      this.eventosSeleccionados = this.eventosSeleccionados.filter(ev => ev.id !== item.id);
    }

  }
}