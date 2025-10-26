import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  url_event: string;
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
  private cdr = inject(ChangeDetectorRef); // Inyectamos el ChangeDetectorRef

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
            imagen: 'assets/brincos.png',
            url_event: ''
          });
        }
        this.cargando = false;
        this.cdr.markForCheck(); // Le decimos a Angular que revise los cambios
      },
      error: (error) => {
        console.error('Error al obtener los eventos:', error);
        this.cargando = false;
        // Opcional: mostrar un slide de error
        this.slides = [{
          titulo: 'Error',
          fecha: 'No se pudieron cargar los eventos',
          lugar: 'Intenta de nuevo más tarde',
          imagen: 'assets/brincos.png',
          url_event: ''
        }];
        this.cdr.markForCheck(); // Le decimos a Angular que revise los cambios
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
      imagen: evento.image_event_online,
      url_event: evento.url_event
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
    share(): void {
    const currentUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Mira este registro en Balam tickets:',
        url: currentUrl,
      }).catch((err) => {
        console.error('Error al compartir:', err);
      });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert('URL copiada al portapapeles ✅');
    }
  }
}
