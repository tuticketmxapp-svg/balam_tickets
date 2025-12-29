import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { LocalStorageService } from '../../services/UserDataService.service';
import { VerificationCodeComponent } from '../verificationCode/verificationCode';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import { InfoEventoComponent } from './info-evento/info-evento';

@Component({
  selector: 'app-mis-eventos',
  standalone: true,
  imports: [
    CommonModule,
    VerificationCodeComponent,
    InfoEventoComponent
  ],
  templateUrl: './mis-eventos.html',
  styleUrls: ['./mis-eventos.css']
})
export class MisEventos implements OnInit {

  // ---- estados generales
  user: any;
  validate = 0;

  // ---- paginación
  eventUpcomming: any[] = [];
  currentPage = 1;
  totalPages = 0;
  pageNumbers: number[] = [];
  apiUrl = '';

  // ---- modales
  showVerificationModal = false;
  infoData: any;
  dataLogin: any = null;
  showInfoModal = signal(false);
infoEventoData = signal<any>(null);
  constructor(
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private cdr: ChangeDetectorRef
  ) { }

  // ===================== INIT =====================
  ngOnInit(): void {


    this.scrollToTop();
    this.getPaginatedData();

    const userData = JSON.parse(
      this.localStorageService.getItem('user_data') ?? 'null'
    );

    this.user = userData;
    this.validate = userData ? userData.validate_code : 0;
  }

  // ===================== UTIL =====================
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===================== DATA =====================
  getPaginatedData() {
    //this.loaderService.showLoader();

    this.clientService.getEventUpcomming(this.currentPage).subscribe({
      next: (response: any) => {
        //this.loaderService.hideLoader();
        this.totalPages = response.last_page;
        this.eventUpcomming = response.data;
        console.log('this.eventUpcomming',this.eventUpcomming)
        this.cdr.detectChanges();
        this.apiUrl = response.path;
        this.pageNumbers = this.generatePageNumbers(
          this.currentPage,
          this.totalPages
        );
      },
      // error: () => this.loaderService.hideLoader()
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

  changePage(page: number) {
    this.currentPage = page;
    this.getPaginatedData();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPaginatedData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPaginatedData();
    }
  }

  // ===================== INFO EVENTO =====================
  openInfo(id: any, data: any) {
    if (
      data.status === 'PR' &&
      data.formaPago === 'OXXO' &&
      data.url_oxxo
    ) {
      window.open(data.url_oxxo);
      return;
    }

    this.infoData = { id, data };
   this.infoEventoData.set({ id, data });
  this.showInfoModal.set(true);
  }

  closeInfoModal() {
   this.showInfoModal.set(false);
    this.infoData = null;
  }

  // ===================== VERIFICACIÓN =====================
  verificar() {
    this.showVerificationModal = true;
  }

  onVerified() {
    this.showVerificationModal = false;
    // aquí puedes refrescar data o mostrar mensaje
  }

  closeVerification() {
    this.showVerificationModal = false;
  }
}
