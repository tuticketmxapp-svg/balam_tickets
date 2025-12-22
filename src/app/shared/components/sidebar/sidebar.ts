import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTicket, faClockRotateLeft, faUser, faCircleQuestion, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

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
}
