import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { SHome } from '../../services/shome';
import { Evento } from '../../models/Ievento';
import { Subscription } from 'rxjs';

interface Slide {
  titulo: string;
  fecha: string;
  lugar: string;
  imagen: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  faShareAlt = faShareAlt;
  faHeart = faHeart;

  slides: Slide[] = [];
  cargando = true;
  currentIndex = 0;

  private intervalId?: ReturnType<typeof setInterval>;
  private eventosSubscription?: Subscription;

  constructor(private sHome: SHome) {}

  ngOnInit(): void {
    // this.startCarousel();
    this.eventosSubscription = this.sHome.getEventos().subscribe({
      next: (eventos) => {
        this.slides = eventos.map(this.transformarEventoASlide);
        
        if (this.slides.length === 0) {
          this.slides.push({
            titulo: 'Próximamente',
            fecha: 'Nuevos eventos muy pronto',
            lugar: 'Mantente al pendiente',
            imagen: 'assets/brincos.png'
          });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los eventos:', error);
        this.cargando = false;
        // Opcional: mostrar un slide de error
        this.slides = [{
          titulo: 'Error',
          fecha: 'No se pudieron cargar los eventos',
          lugar: 'Intenta de nuevo más tarde',
          imagen: 'assets/brincos.png'
        }];
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiamos el intervalo y la suscripción para evitar fugas de memoria
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.eventosSubscription) {
      this.eventosSubscription.unsubscribe();
    }
  }

  private transformarEventoASlide(evento: Evento): Slide {
    console.log('Transformando evento:', evento);
    const fechaEvento = new Date(`${evento.event_date}T${evento.event_time}`);

    const fechaFormateada = fechaEvento.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase().replace('.', '');

    const horaFormateada = fechaEvento.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      titulo: evento.name,
      fecha: `${fechaFormateada} | ${horaFormateada}`,
      lugar: evento.enclosure_name,
      imagen: evento.image_event_online
    };
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => this.nextSlide(), 5000); // Cambia cada 5 segundos
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.slides.length - 1;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex < this.slides.length - 1) ? this.currentIndex + 1 : 0;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }
}
