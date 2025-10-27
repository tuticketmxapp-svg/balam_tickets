import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EventoDetalle } from '../../models/evento-detalle.model';
import moment from 'moment';
import { SPayment } from '../../services/payment';
import { Subscription } from 'rxjs';
import { VerificacionCodigoModalComponent } from "./verificacion-codigo-modal";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos-compra-modal',
  standalone: true,
  imports: [CommonModule, VerificacionCodigoModalComponent],
  templateUrl: './terminos-compra-modal.html',
  styleUrls: ['./terminos-compra-modal.css']
})
export class TerminosCompraModal implements OnChanges {

  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();
  @Input() evento: EventoDetalle | null = null;
  @Input() dataCliente: null = null;
  @Input() dataEventExtra: any = null;
  mensaje: string = '';
  mostrarModalVerificacion: boolean = false;
  private eventosSubscription?: Subscription;
  holdToken: string = '';
  constructor(private sPayment: SPayment, private router: Router) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.obtenerHoldToken();
    console.log('mostrarModalVerificacion', this.mostrarModalVerificacion);
  }
  obtenerHoldToken() {
    this.sPayment.getHolToken().subscribe({
      next: (res) => {
        console.log('✅ holdToken recibido:', res);
        this.holdToken = res?.holdToken || res; // Ajusta según cómo venga el JSON
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
    const eventoPrincipal = this.evento;               // viene del @Input
    const eventosExtras = this.dataEventExtra || []; // viene del componente hijo
    const cliente = this.dataCliente || {};  // datos del formulario
    const {
      nombreTitular = '',
      telefono = '',
      email = ''
    } = this.dataCliente || {};
    console.log('cliente', cliente);
    const todos = [eventoPrincipal, ...eventosExtras];
    const resultado: any = {};

    todos.forEach((evento) => {
      console.log('evento', this.evento);
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
      next: (res) => {
       const eventosRegistradosNombres = res.map((e: { name: any; }) => e.name);

      
       let mensaje = `✅ Se generaron registros nuevos para los eventos: ${eventosRegistradosNombres.join(', ')}.`;
        if (res.length === 0) {
          Swal.fire({
            icon: 'warning', // 'success', 'error', 'info', 'question'
            title: '⚠️ Atención',
            text: 'Usted ya contaba con registros previos para todos los eventos seleccionados.',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/']); // redirige al home
            }
          });
        } else {
          const mensaje = `Se generaron registros nuevos para los eventos: ${eventosRegistradosNombres.join(', ')}. 
Ya contaba con registro previo para los eventos:.`;
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
            if (result.isConfirmed) {
              const codigoIngresado = result.value;
              console.log('Código ingresado:', codigoIngresado);
              // Aquí puedes llamar a tu función para validar el código
            }
          });
        }
      },
      error: (err) => console.error('Error en prebook', err)
    });


   

    return resultado;
  }
  validarCodigo(codigo: string) {
    console.log('Código ingresado desde modal:', codigo);
    // Aquí agregas la lógica de validación
  }

}