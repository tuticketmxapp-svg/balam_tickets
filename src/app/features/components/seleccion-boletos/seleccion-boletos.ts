import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TerminosCompraModal } from './terminos-compra-modal';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SHome } from '../../services/shome';
import { Evento } from '../../models/Ievento';

@Component({
  selector: 'app-seleccion-boletos',
  standalone: true,
  imports: [InfoEvento, CurrencyPipe, TerminosCompraModal, RouterModule],
  templateUrl: './seleccion-boletos.html',
  styleUrls: ['./seleccion-boletos.css'],
})
export class SeleccionBoletos implements OnInit {
  evento: Evento | null = null;
  // Definimos los tipos de boletos con su información y contador
  boletos = [
    {
      titulo: 'SEA + FRESCO EN MERIDA',
      subtitulo: 'PREVENTA VIP FASE 1',
      precio: 150,
      cantidad: 0,
      descripcion: '¡Eleva tu experiencia! Asegura tu boleto VIP en preventa y disfruta de un acceso exclusivo a la zona más premium del evento.',
      beneficios: [
        { titulo: 'Acceso anticipado', texto: 'Sé de los primeros en entrar y consigue la mejor ubicación.' },
        { titulo: 'Zona preferencial', texto: 'Disfruta de una vista privilegiada en un área exclusiva.' },
        { titulo: 'Comida y bebida de cortesía', texto: 'Accede a una selección especial de snacks y bebidas.' },
        { titulo: 'Baños exclusivos', texto: 'Utiliza sanitarios privados para tu comodidad.' },
        { titulo: 'Kit de bienvenida', texto: 'Recibe un obsequio conmemorativo del evento.' }
      ]
    },
    {
      titulo: 'SEA + FRESCO EN MERIDA',
      subtitulo: 'PREVENTA GENERAL',
      precio: 100,
      cantidad: 0,
      descripcion: '¡Asegura tu entrada! Con el boleto de acceso general, podrás disfrutar de todas las atracciones y escenarios principales del evento. La mejor opción para vivir la experiencia completa y vibrar con la energía del lugar.',
      beneficios: [] // Sin beneficios específicos para el boleto general
    }
  ];
  isTerminosModalVisible = false;

  constructor(
    private route: ActivatedRoute,
    private sHome: SHome
  ) {}

  ngOnInit(): void {
    const urlEvent = this.route.snapshot.paramMap.get('url_event');
    if (urlEvent) {
      this.sHome.getEventoById(urlEvent).subscribe(data => {
        this.evento = data;
        console.log('Evento cargado:', this.evento);
        // Aquí puedes mapear los `zonePrices` del evento a tu array `boletos`
      });
    }
  }

  // Funciones para el contador
  incrementar(boleto: any) {
    if (boleto.cantidad < 10) {
      boleto.cantidad++;
    }
  }

  decrementar(boleto: any) {
    if (boleto.cantidad > 0) {
      boleto.cantidad--;
    }
  }

  get totalBoletosSeleccionados(): number {
    return this.boletos.reduce((total, boleto) => total + boleto.cantidad, 0);
  }


  openTerminosModal() {
    console.log('Abriendo modal de términos y condiciones');
    this.isTerminosModalVisible = true;
  }

  closeTerminosModal() {
    this.isTerminosModalVisible = false;
  }
}
