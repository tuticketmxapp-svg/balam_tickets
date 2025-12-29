import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { InfoEvento } from '../../../shared/info-evento/info-evento';

@Component({
  selector: 'app-resumen-compra',
  standalone: true,
  imports: [CommonModule, InfoEvento],
  templateUrl: './resumen-compra.html',
  styleUrls: ['./resumen-compra.css'],
})
export class ResumenCompra implements OnInit, OnDestroy {

  data: any;
  fechaformat!: string;
  horas!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('saleData');

      if (storedData) {
        this.data = JSON.parse(storedData);
        console.log('this.data',this.data)
        const expiresAt = new Date(this.data.expires_at);
        const fecha = moment(expiresAt).subtract(20, 'minutes');

        this.fechaformat = fecha.format('DD-MM-YYYY hh:mm A');
        this.horas = fecha.format('hh:mm A');

        if (this.data?.holdToken) {
          localStorage.removeItem('setEvent-' + this.data.holdToken);
          localStorage.removeItem('setSale-' + this.data.holdToken);
          localStorage.removeItem('holdToken');
        }
      }
    }

    this.scrollToTop();
  }
get totalGeneral() {
    return this.data.total;
  }
  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goPerfil(): void {
    this.router.navigate(['dashboard/mis-compras']);
  }

  redirectToPayment(): void {
    if (typeof window !== 'undefined' && this.data?.urlOxxo) {
      window.open(this.data.urlOxxo, '_blank');
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saleData');
    }
  }
}
