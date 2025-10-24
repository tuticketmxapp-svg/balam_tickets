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

  private sHome = inject(SHome);
  private cdr = inject(ChangeDetectorRef);

  todosLosEventos: Evento[] = [];
  cargando = true;

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
    // Aquí puedes añadir lógica para guardar los eventos seleccionados
    console.log('Eventos adicionales seleccionados...');
    this.close();
    // El routerLink en el botón original se encargará de la navegación
  }
}