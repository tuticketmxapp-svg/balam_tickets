import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';

import { ClientService } from '../../../services/client.service';
import { LocalStorageService } from '../../../services/UserDataService.service';
import { environment } from '../../../../../environments/environment';

moment.locale('es');

@Component({
  selector: 'app-info-evento',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './info-evento.html',
  styleUrls: ['./info-evento.scss']
})
export class InfoEventoComponent implements OnInit {

  @Input({ required: true }) data!: any;
  @Output() closed = new EventEmitter<void>();

  dataTickets = signal<any[]>([]);
  validate = signal<boolean>(false);
  downloadLinks = signal<any[]>([]);
  today = signal<string>('');

  constructor(
    private clientService: ClientService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.calculateValidation();
    this.getInfoTickets();
    this.scrollDown();
  }

  calculateValidation(): void {
    const today = moment().format('YYYY-MM-DD');
    this.today.set(today);

    const eventDate = moment(this.data?.data?.event?.event_date).format('YYYY-MM-DD');

    this.validate.set(
      [208, 220, 222].includes(this.data?.data?.evento)
        ? true
        : today >= eventDate
    );
  }

  getInfoTickets(): void {
    this.clientService.getInfoSale(this.data.id).subscribe((response: any[]) => {
      this.dataTickets.set(
        response.map(ticket => ({
          ...ticket,
          ticket_price: Number(ticket.ticket_price),
          ticket_comision: Number(ticket.ticket_comision),
          urlDownload: `${environment.apiV1}cliente/download/ticket?hash=${btoa(
            `${this.data.id}-${ticket.ticket_id}`
          )}`
        }))
      );
    });
  }

  openPdf(evento: string, order: number, numero: number, base64: string): void {
    const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = `${evento}-${order}-${numero}.pdf`;
    a.click();
  }

  scrollDown(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  close(): void {
    this.closed.emit();
  }
}
