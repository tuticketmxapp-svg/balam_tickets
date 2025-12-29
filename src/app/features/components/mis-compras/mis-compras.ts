import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.css']
})
export class MisCompras implements OnInit {

  eventPast: any[] = [];
  pageSize = 10;
  pageIndex = 0;
  currentPage = 1;
  totalPages!: number;
  paginatedData!: any[];
  pageNumbers!: number[];
  apiUrl!: string;
  page = 1;
  idUser!: string | null;

  defaultImage = './assets/img-not-found.png';

  constructor(
    public clientService: ClientService,
    //private loaderService: LoaderService,
    //private sidebarClickService: SidebarClickService
  ) {}

  ngOnInit(): void {
    // this.sidebarClickService.setMenuActive({
    //   title: 'Mis Compras',
    //   icon: faClockRotateLeft
    // });

    this.getEventPast();
  }

  getEventPast(): void {
    this.idUser = localStorage.getItem('user_id');

    //this.loaderService.showLoader();
    this.clientService.getEventPast(this.currentPage).subscribe((data: any) => {
      //this.loaderService.hideLoader();

      this.eventPast = data.data;
      console.log('this.eventPast ',this.eventPast )
      this.eventPast.forEach(event => {
        const img = new Image();
        img.src = event.event.image_event_ticket_office;
        img.onerror = () => {
          event.event.image_event_ticket_office = this.defaultImage;
        };
      });

      this.totalPages = data.last_page;
      this.apiUrl = data.path;
      this.pageNumbers = this.generatePageNumbers(this.currentPage, this.totalPages);
    });
  }

  generatePageNumbers(currentPage: number, totalPages: number): number[] {
    const groupSize = 10;
    const groupNumber = Math.ceil(currentPage / groupSize);
    const startPage = (groupNumber - 1) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  changePage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.page = pageNumber;
    this.getEventPast();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getEventPast();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getEventPast();
    }
  }
}
