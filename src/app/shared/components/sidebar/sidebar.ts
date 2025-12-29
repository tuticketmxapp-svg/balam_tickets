import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTicket, faClockRotateLeft, faUser, faCircleQuestion, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { LocalStorageService } from '../../../features/services/UserDataService.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class SidebarComponent {
  faTicket = faTicket;
  faClockRotateLeft = faClockRotateLeft;
  faUser = faUser;
  faCircleQuestion = faCircleQuestion;
  faArrowLeft = faArrowLeft;
  isLoggedIn: boolean = false;
  me: any;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
  ) { }
  onActivate(event: any) {
    const userData = this.localStorageService.getItem('user_data');

    if (userData) {
      this.me = JSON.parse(userData);
    } else {
      this.me = null;
    }
  }

  cerrarSesion() {
    // Limpiar todo
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    localStorage.removeItem('selectedObjets');
    localStorage.removeItem('saleData');
    localStorage.removeItem('holdToken');
    localStorage.removeItem('general');
    localStorage.removeItem('idEvento');
    localStorage.removeItem('access_token');

    // Navegar a /
    this.router.navigate(['/'], { replaceUrl: true }).then(() => {
      // Forzar recarga completa de la página
      window.location.reload();
    });
  }

}
