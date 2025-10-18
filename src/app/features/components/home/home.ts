import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { SHome } from '../../services/shome';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  faShareAlt = faShareAlt;
  faHeart = faHeart;

  constructor(private sHome: SHome) {}

  ngOnInit(): void {
    this.sHome.getEventos().subscribe({
      next: (data) => {
        console.log('Respuesta de la petición de eventos:', data);
      },
      error: (error) => {
        console.error('Error al obtener los eventos:', error);
      }
    });
  }
}
