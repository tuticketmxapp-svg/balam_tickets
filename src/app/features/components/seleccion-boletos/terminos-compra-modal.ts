import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit } from '@angular/core';
import { EventoDetalle } from '../../models/evento-detalle.model';
import moment from 'moment';
import { SPayment } from '../../services/payment';
import { Subscription } from 'rxjs';
import { VerificacionCodigoModalComponent } from "./verificacion-codigo-modal";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-terminos-compra-modal',
  standalone: true,
  imports: [CommonModule, VerificacionCodigoModalComponent, LottieComponent],
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal implements OnInit {

  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() evento: EventoDetalle | null = null;
  @Input() dataCliente: null = null;
  @Input() dataEventExtra: any = null;
  mensaje: string = '';
  mostrarModalVerificacion: boolean = false;
  private eventosSubscription?: Subscription;
  holdToken: string = '';
  isLoading = false;

  constructor(private sPayment: SPayment, private router: Router) { }
  lottieOptions: AnimationOptions = {
    path: '/assets/loader.json',
  };
  ngOnInit(): void {
    this.obtenerHoldToken();
  }
  obtenerHoldToken() {
    this.sPayment.getHolToken().subscribe({
      next: (res) => {
        this.holdToken = res?.holdToken || res;
      },
      error: (err) => {
        console.error('❌ Error al obtener holdToken:', err);
      }
    });
  }

  close() {
    this.closeModal.emit();
  }
  terminos() {
    this.generarEstructuraEventos();

  }
  generarEstructuraEventos() {
    this.isLoading = true;

    const eventoPrincipal = this.evento;
    const eventosExtras = this.dataEventExtra || [];
    const cliente = this.dataCliente || {};
    const {
      nombreTitular = '',
      telefono = '',
      email = ''
    } = this.dataCliente || {};
    const todos = [eventoPrincipal, ...eventosExtras];
    const resultado: any = {};

    todos.forEach((evento) => {
      const zonas = evento.zone_prices || evento.zonePrices || [];

      resultado[evento.id] = {
        evento: evento.id,
        forma_pago: 'registro',
        canal_venta: 2,
        metodo_pago: '3',
        total: 0,
        subtotal: 0,
        comision: 0,
        tickets: zonas.map((z: any) => ({

          type: 'GENERAL',
          zona: z.id,
          seat_io: z.section,
          cantidad: 1,
          subtotal: z.price,
          comision: z.commission,
          fila: z.section,
          asiento: z.section,
          label: z.name,
          section: z.section,
          name: z.name,
          tipoMesa: false,
          type_id: null,
          category: null
        })),
        event_date: evento.event_date,
        event_time: evento.event_time,
        image_event_online: evento.image_event_online,
        short_description: evento.short_description,
        enclosure_name: evento.enclosure_name,
        nombre_titular: nombreTitular,
        email_titular: email,
        telefono_titular: telefono,
        parametro: "",
        tipo_pago: "1",
        vendido_por: "1",
        info_promo: "",
        credit: 0,
        nomina: 0,
        cambio: 0,
        efectivo: 0,
        card: 0,

        ltsdgt: "",
        country_id: 142,
        state_id: 3466,
        city_id: 72261,
        postal_code: "",
        address: "",
        holdToken: this.holdToken,
        plan: 1,
        pais: "Mexico",
        estado: "Chiapas",
        ciudad: "Tuxtla",
        descriptionEvento: evento?.short_description,
        address1: "22",
        address2: "343",
        formObject: {
          card_number: "4111111111111111",
          holder_name: "Jonh Doe",
          expiration_year: "28",
          expiration_month: "06",
          cvv2: "123",
          address: {
            city: "Mérida",
            line3: ".",
            postal_code: "97110",
            line1: "22",
            line2: "343",
            state: "Yucatán",
            country_code: "MX"
          }
        },
        deviceDataId: "zn0QzKq9vFjY9rHd0Yq1PIWBZFMRi2Qt",
        telefono: telefono,
        fechaCompra: moment().format('DD MMM. YYYY'),
        checkDireccion: false,
        codigoPostal: "97110",
        vendedor: "",
        user_id: "1"
      };
    });
    
    this.sPayment.prebook(resultado).subscribe({
      next: (res: any) => {
        // Detectar si es array o solo objeto con mensaje
        const eventosRegistradosNombres = Array.isArray(res)
          ? res.map((e: any) => e.eventName)
          : [];

        if (res?.message === 'No fue posible registrarlo al evento' || eventosRegistradosNombres.length === 0) {
          // Todos los eventos ya estaban registrados
          Swal.fire({
            icon: 'warning',
            title: '⚠️ Atención',
            text: 'Usted ya contaba con registros previos para todos los eventos seleccionados.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.isLoading = false; // 🔹 Se quita loader cuando cierra modal
            this.router.navigate(['/']);
          });
        } else {
          this.isLoading = false;
          console.log('Registro Parcial',this.isLoading);
          // Algunos eventos nuevos
          const mensaje = `Se generaron registros nuevos para los eventos: ${eventosRegistradosNombres.join(', ')}.`;
          Swal.fire({
            icon: 'info',
            title: 'Registro Parcial',
            html: `<p>${mensaje}</p>
               <p>Para ver el resumen de su registro, revise su email e ingrese el código de verificación:</p>
               <input id="codigo-verificacion" class="swal2-input" placeholder="Código de Verificación">`,
            showCancelButton: true,
            confirmButtonText: 'Validar Código',
            preConfirm: () => {
              const codigo = (document.getElementById('codigo-verificacion') as HTMLInputElement).value;
              if (!codigo) {
                Swal.showValidationMessage('Debes ingresar el código de verificación');
              }
              return codigo;
            }
          }).then((result) => {
            this.isLoading = false; // 🔹 Quitar loader al cerrar modal
            if (result.isConfirmed) {
              const payload = {
                email: email || '',
                codigo_verificacion: result.value
              };
              this.sPayment.validarCodigo(payload).subscribe({
                next: (res) => {
                  Swal.fire(res.success ? 'Éxito' : 'Error', res.message, res.success ? 'success' : 'error');
                  this.router.navigate(['/']);
                },
                error: () => {
                  Swal.fire('Error', 'No se pudo validar el código', 'error');
                  this.router.navigate(['/']);
                }
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/']);
            }
          });
        }
      },
      error: (err) => {
        const mensaje = err?.error?.message || 'Ocurrió un error al procesar el registro.';
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.isLoading = false; // 🔹 Siempre quitar loader después del modal
        });
       
      }
      
    });
 this.isLoading = false;
  }
  validarCodigo(codigo: string) {
  }

}