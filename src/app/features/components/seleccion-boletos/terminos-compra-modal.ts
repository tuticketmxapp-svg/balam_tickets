import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../services/evento.service';
import { PaymentService } from '../../services/payment.service';



declare var OpenPay: any;

@Component({
  selector: 'app-terminos-pay-modal',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal {

  @Input() visible = false;
  @Input() boleto: any;

  @Output() close = new EventEmitter<void>();

  constructor(
    private eventoService: EventoService,
     private paymentService: PaymentService,
    // private alertService: SweetAlertService,
    //private loaderService: LoaderService
  ) {}

  cerrar(): void {
    this.close.emit();
  }

  aceptarTerminos(): void {
    this.saleTicket();
  }

  // ===============================
  // LÓGICA DE VENTA (MISMA QUE TENÍAS)
  // ===============================

  saleTicket(): void {
    //this.loaderService.showLoader();

    if (this.boleto?.tokenCard) {
      this.prebookConToken();
    } else if (this.boleto?.formObject) {
      this.prebookYTokenizar();
    } else {
      this.ventaDirecta();
    }
  }

  private ventaDirecta(): void {
    this.eventoService.saleEvent(this.boleto).subscribe({
      next: (r) => {
        //this.loaderService.hideLoader();
        localStorage.setItem('saleData', JSON.stringify(r));
        this.cerrar();
      },
      error: (err) => {
        // this.loaderService.hideLoader();
        // this.alertService.error(err);
      }
    });
  }

  private prebookConToken(): void {
    this.eventoService.prebook(this.boleto).subscribe({
      next: (r) => {
        this.boleto.ordenId = r.ordenId;
        this.SuccessCallback({ data: { id: this.boleto.tokenCard } });
        this.cerrar();
      },
      error: (err) => {
        // this.loaderService.hideLoader();
        // this.alertService.error(err);
      }
    });
  }

  private prebookYTokenizar(): void {
    this.eventoService.prebook(this.boleto).subscribe({
      next: (r) => {
        this.boleto.ordenId = r.ordenId;
        this.tokenOpenPay();
      },
      error: (err) => {
        // this.loaderService.hideLoader();
        // this.alertService.error(err);
      }
    });
  }

  tokenOpenPay(): void {
    OpenPay.token.create(
      this.boleto.formObject,
      (response: any) => this.SuccessCallback(response),
      (error: any) => {
        // this.loaderService.hideLoader();
        this.ErrorCallback(error?.data?.description || error.description);
      }
    );
  }

  SuccessCallback(response: any): void {
    const json = {
      source_id: response.data.id,
      method: 'card',
      amount: this.boleto.total.toString(),
      description: `${this.boleto.ordenId}-${this.boleto.descriptionEvento}`,
      device_session_id: this.boleto.deviceDataId,
      order_id: this.boleto.ordenId,
      name: this.boleto.nombre_titular,
      phone_number: this.boleto.telefono,
      email: this.boleto.email_titular,
      event_id: this.boleto.evento,
      user_id: this.boleto.user_id
    };

    this.paymentService.charge(json).subscribe({
      next: () => {
        // this.loaderService.hideLoader();
        localStorage.setItem('saleData', JSON.stringify(this.boleto));
        this.cerrar();
      },
      error: (err) => {
        // this.loaderService.hideLoader();
        this.ErrorCallback(err);
      }
    });
  }

  ErrorCallback(msg: string): void {
    // this.alertService.error(msg);
  }
}
