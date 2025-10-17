import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareAlt, faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-info-evento',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './info-evento.html',
  styleUrls: ['./info-evento.css']
})
export class InfoEvento {
  faShareAlt = faShareAlt;
  faHeart = faHeart;
}
