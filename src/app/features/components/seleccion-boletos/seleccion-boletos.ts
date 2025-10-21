import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TerminosCompraModal } from './terminos-compra-modal';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SHome } from '../../services/shome';
import { Evento } from '../../models/Ievento';
import { EventoDetalle } from '../../models/evento-detalle.model';

@Component({
  selector: 'app-seleccion-boletos',
  standalone: true,
  imports: [InfoEvento, CurrencyPipe, TerminosCompraModal, RouterModule],
  templateUrl: './seleccion-boletos.html',
  styleUrls: ['./seleccion-boletos.css'],
})
export class SeleccionBoletos implements OnInit {
  evento: EventoDetalle | null = null;
  isTerminosModalVisible = false;

  constructor(
    private route: ActivatedRoute,
    private sHome: SHome,
    private router: Router
  ) {}

  ngOnInit(): void {
    const urlEvent = this.route.snapshot.paramMap.get('url_event');
    if (urlEvent) {
      this.sHome.getEventoById(urlEvent).subscribe({
        next: (data) => {
          this.evento = data;
          // Inicializamos la cantidad de boletos para cada zona
          this.evento.zone_prices.forEach((zona) => (zona.cantidad = 0));
          console.log('Evento cargado:', this.evento);
        },
        error: (err) => {
          console.error('Error al cargar el evento', err);
          // Opcional: Redirigir a una página de error o a home
          this.router.navigate(['/']);
        },
      });
    }
  }

  // Funciones para el contador
  incrementar(boleto: any) {
    if (boleto.cantidad < 10) { // Considera usar `boleto.max` si está disponible
      boleto.cantidad++;
    }
  }

  decrementar(boleto: any) {
    if (boleto.cantidad > 0) { // Considera usar `boleto.min` si está disponible
      boleto.cantidad--;
    }
  }

  get totalBoletosSeleccionados(): number {
    if (!this.evento) {
      return 0;
    }
    return this.evento.zone_prices.reduce((total, zona) => total + (zona.cantidad || 0), 0);
  }

  openTerminosModal() {
    this.isTerminosModalVisible = true;
  }

  closeTerminosModal() {
    this.isTerminosModalVisible = false;
  }
}
