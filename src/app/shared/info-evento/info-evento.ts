import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { EventoDetalle } from '../../features/models/evento-detalle.model';

@Component({
  selector: 'app-info-evento',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './info-evento.html',
  styleUrls: ['./info-evento.css'],
})
export class InfoEvento {
  @Input() evento: EventoDetalle | null = null;

  faShareAlt = faShareAlt;
  faHeart = faHeart;

  get fechaFormateada(): string {
    console.log('this.evento', this.evento);
    if (!this.evento || !this.evento.event_date || !this.evento.event_time) {
      return 'Fecha no disponible';
    }

    try {
      // Creamos un objeto Date combinando la fecha y la hora.
      const fechaCompleta = new Date(`${this.evento.event_date}T${this.evento.event_time}`);

      const formatoFecha = new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(fechaCompleta);

      // Formateamos la hora (ej: 11:00 PM)
      const formatoHora = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(fechaCompleta);

      // Unimos y devolvemos el string final en mayúsculas.
      return `${formatoFecha.replace('.', '')} | ${formatoHora}`.toUpperCase();
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return this.evento.event_date; // Si hay un error, mostramos al menos la fecha original.
    }
  }
  share(): void {
    const currentUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Mira este registro en Balam Tickets:',
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
