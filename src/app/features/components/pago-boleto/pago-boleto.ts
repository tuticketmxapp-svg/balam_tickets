import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { SHome } from '../../services/shome';
import { EventoDetalle } from '../../models/evento-detalle.model';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { ResumenCompraModal } from './resumen-compra-modal';
import { TerminosCompraModal } from '../seleccion-boletos/terminos-compra-modal';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { CatalogosService } from '../../services/catalogos.service';
import { ConektaService } from '../../services/conekta.service';
import { EventoService } from '../../services/evento.service';
moment.locale('es');

type MetodoPagoConfig = {
  cbase: number;
  cimporte: number;
  cmeses?: Record<number, number>;
};
type Pasarela =
  | 'Bancomer'
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'TPV'
  | 'OXXO';
declare var OpenPay: any;
interface Ticket {
  type: string;
  type_id: number | null;
  zona: any;
  seat_io: string;
  cantidad: any;
  subtotal: string;
  comision: number;
  fila: string;
  asiento: string;
  category: string;
  label: string;
  section: any;
  name: any;
  tipoMesa: any;
  subtotalOxxo: any;
}

@Component({
  selector: 'app-pago-boleto',
  standalone: true,
  imports: [InfoEvento, RouterModule, ReactiveFormsModule, ResumenCompraModal, TerminosCompraModal, LottieComponent],
  templateUrl: './pago-boleto.html',
  styleUrls: ['./pago-boleto.css'],
})

export class PagoBoleto implements OnInit {
  pagoForm: FormGroup;
  submitted = false;
  evento: EventoDetalle | null = null; // Propiedad para almacenar los datos del evento
  dataCliente: any;
  isResumenModalVisible = false;
  isLoading = false;
  isTerminosModalVisible = false;
  private cdr = inject(ChangeDetectorRef); // Inyectamos el ChangeDetectorRef
  dataEventExtra: any = null;
  habilitadoPorHora = false;
  optionsPay = [
    { value: 'Visa', imageUrl: './assets/tarjetas.png', altText: 'Visa/MasterCard', name: 'Visa/MasterCard' },
    { value: 'Bancomer', imageUrl: './assets/bbva.png', altText: 'Bancomer', name: 'Bancomer' },
    { value: 'OXXO', imageUrl: './assets/oxxo.png', altText: 'OXXO', name: 'OXXO' },
  ];
  pasarela: Pasarela = 'Visa';
  selectedOption: string = this.optionsPay[0].value;
  exerpexcerptcb = 0;
  subtotal = 0;

  metodoPago: Record<Pasarela, MetodoPagoConfig> = {
    Bancomer: {
      cbase: 0.029,
      cimporte: 2.5,
      cmeses: { 3: 0.048, 6: 0.078, 9: 0.0108, 12: 0.0138 }
    },
    Visa: {
      cbase: 0.029,
      cimporte: 2.5,
      cmeses: { 3: 0.048, 6: 0.078, 9: 0.0108, 12: 0.0138 }
    },
    Mastercard: {
      cbase: 0.029,
      cimporte: 2.5,
      cmeses: { 3: 0.048, 6: 0.078, 9: 0.0108, 12: 0.0138 }
    },
    'American Express': {
      cbase: 0.029,
      cimporte: 2.5,
      cmeses: { 3: 0.038, 6: 0.058, 9: 0.078, 12: 0.098 }
    },
    TPV: {
      cbase: 0.03,
      cimporte: 0
    },
    OXXO: {
      cbase: 0.039,
      cimporte: 0
    }
  };

  // Opciones para la animación de Lottie
  lottieOptions: AnimationOptions = {
    path: '/assets/loader.json',
  };
  tasaIVA = 16;
  boleto: any = {
    "evento": 4,
    "nombre_titular": "",
    "email_titular": "",
    "telefono_titular": "",
    "parametro": "",
    "forma_pago": "tarjeta",
    "tipo_pago": '1',
    "vendido_por": '1',
    "canal_venta": 2,
    "metodo_pago": '3',
    "total": 0,
    "subtotal": 0,
    "comision": 0,
    "info_promo": '',
    "credit": 0,
    "nomina": 0,
    "cambio": 0,
    "efectivo": 0,
    "card": 0,
    "tickets": [

    ],
    "ltsdgt": "",
    "country_id": 142,
    "state_id": 3466,
    "city_id": 72261,
    "postal_code": "",
    "address": ""
  };
  desgloseComision: { comision: number; monto: number; } | undefined;
  holderName: string | undefined;
  cardNumber: any;
  expirationYear: any;
  expirationMonth: any;
  cvv2: any;
  street: any;
  number: any;
  references: any;
  postalCode: any;
  city: any;
  cityCard: any;
  state: any;
  countryCode: any;
  countryCodeSelected: any;
  codigoPais: any;
  state2: any;
  deviceDataId: any;
  order_id: any;
  telefono: any;
  private subscription: Subscription = new Subscription();
  listCountries: any;
  listStates: any;
  listCities: any;
  listCities2: any;
  eventGeneral = false;
  holdToken: any;
  general: any;
  idEvento: any;
  saleParams: any;
  saleEvent: any;
  tickets: Ticket[] = [];
  total = 0;
  totalComision = 0;
  cargoBancario = 0;
  totalCobrar = 0;
  stateSelect: any;
  validateHolderName: boolean | undefined;
  validateEmail: boolean | undefined;
  validateTelefono: boolean | undefined;
  validateCardNumber: boolean | undefined;
  validateExpirationYear: boolean | undefined;
  validateExpirationMonth: boolean | undefined;
  validateCvv2: boolean | undefined;
  validateStreet: boolean | undefined;
  validateNumberHome: boolean | undefined;
  validateReferences: boolean | undefined;
  validatePostalCode: boolean | undefined;
  validateCountry: boolean | undefined;
  validateState: boolean | undefined;
  validateCity: boolean | undefined;

  fechaCompra = moment().format('DD MMM YYYY');
  checkDireccion = false;
  me: {
    state: any;
    country: any; country_id: any;
  } | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sHome: SHome,
    private router: Router,
    private catalogosService: CatalogosService,
    private conektaService: ConektaService,
    private eventoService: EventoService,

  ) {
    this.pagoForm = this.fb.group(
      {
        metodoPago: ['', Validators.required],

        nombreTitular: ['', Validators.required],
        telefono: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        confirmarEmail: ['', Validators.required],

        // TARJETA
        numeroTarjeta: [''],
        mesExp: [''],
        anoExp: [''],
        cvv: [''],

        // DIRECCIÓN
        calle: [''],
        numero: [''],
        codigoPostal: [''],
        ciudad: [''],
        estado: [''],
        pais: [''],
      },
      { validators: this.emailCoincide }
    );

  }

  // Getter para fácil acceso a los campos del pagoForm en la plantilla
  get f() { return this.pagoForm.controls; }

  emailCoincide(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email')?.value;
    const confirmarEmail = control.get('confirmarEmail')?.value;
    return email === confirmarEmail ? null : { emailNoCoincide: true };
  }

  ngOnInit(): void {
    const urlEvent = this.route.snapshot.paramMap.get('url_event');
    if (urlEvent) {
      this.isLoading = true; // Mostramos el loader
      this.sHome.getEventoById(urlEvent).subscribe({
        next: (data) => {
          this.evento = data;
          this.isLoading = false; // Ocultamos el loader
          this.cdr.markForCheck(); // Le decimos a Angular que revise los cambios
        },
        error: (err) => {
          console.error('Error al cargar el evento en la página de pago', err);
          this.router.navigate(['/']); // Redirigir a home si hay un error
          this.isLoading = false; // Ocultamos el loader en caso de error
        },
      });
    }
    this.idEvento = this.route.snapshot.queryParamMap.get('idEvento');
    this.general = this.route.snapshot.queryParamMap.get('general');
    this.holdToken = this.route.snapshot.queryParamMap.get('holdToken');
    this.saleParams = JSON.parse(localStorage.getItem('setSale-' + this.holdToken) ?? 'null');
    this.saleEvent = JSON.parse(localStorage.getItem('setEvent-' + this.holdToken) ?? 'null');
    this.verificarHora();
    this.saleParams.forEach((element: {
      subtotalOxxo: any; category: string; label: string; price: string; comision: string; type: any; name: any; type_id: any; zone_id: any; cantidadArray: any; section: any; tipoMesa: any;
    }) => {
      let fila = '';
      let asiento = '';
      if (element.category != "GENERAL" && element.category != '1') {
        let elementos = element.label.split("-");
        elementos.forEach((elemento, key) => {
          if (key == 1) {
            fila = elemento;
          }
          if (key == 2) {
            asiento = elemento;
          }
        });
      } else {
        fila = 'GENERAL';
        asiento = 'GENERAL';
      }
      this.total += parseFloat(element.price);
      this.totalComision += parseFloat(element.comision);
      this.tickets.push({
        "type": element.type || element.name,
        "type_id": element.type_id || null,
        "zona": element.zone_id,
        "seat_io": element.label,
        "cantidad": element.cantidadArray,
        "subtotal": element.price,
        "comision": parseInt(element.comision),
        "fila": fila,
        "asiento": asiento,
        "category": element.category,
        "label": element.label,
        "section": element.section,
        "name": element.name,
        "tipoMesa": element.tipoMesa,
        "subtotalOxxo": element.subtotalOxxo
      });
    });

  }
  verificarHora() {
    const ahora = new Date();
    const hoy9am = new Date();
    hoy9am.setHours(9, 0, 0, 0);


    this.habilitadoPorHora = ahora >= hoy9am;
  }
  // ... resto de tu lógica para el pagoForm
  onSubmit() {
    this.submitted = true;

    if (this.pagoForm.invalid) {
      return;
    }

    const metodo = this.pagoForm.get('metodoPago')?.value;

    switch (metodo) {
      case 'Visa':
        this.pagarConTarjeta();
        break;

      case 'Bancomer':
        this.pagarConBancomer();
        break;

      case 'OXXO':
        this.pagarConOxxo();
        break;

      default:
        console.error('Método de pago no válido');
        break;
    }
  }

  getCountries() {
    this.subscription.add(
      this.catalogosService.getCountries().subscribe(c => {
        this.listCountries = c;
        const countryId = this.me?.country_id;

        const selectedCountry = countryId
          ? this.listCountries.find((c: { id: any; }) => c.id === countryId)
          : null;

        if (selectedCountry) {
          this.countryCode = selectedCountry.code;
        }
      }, (error: any) => {
        //this.alertService.error(error);
      })
    );
  }
  getStates(idCountry: any) {
    this.subscription.add(
      this.catalogosService.getStates(idCountry).subscribe(c => {
        this.listStates = c;
        this.pagoForm.controls['state'].setValue(this.stateSelect);
        this.pagoForm.controls['state'].setValue(this.stateSelect);
      }, (error: any) => {
        //this.alertService.error(error); 
      })
    )
  }
  getCities(idState: any) {
    this.subscription.add(
      this.catalogosService.getCities(idState).subscribe(c => {
        this.listCities = c;
      }, (error: any) => {
        //this.alertService.error(error); 
      })
    )
  }
  pagarConTarjeta() {
    const formObject = {
      card_number: this.cardNumber,
      holder_name: this.pagoForm.value.nombreTitular,
      expiration_year: this.expirationYear,
      expiration_month: this.expirationMonth,
      cvv2: this.cvv2,
      address: {
        city: this.city,
        line3: '.',
        postal_code: this.pagoForm.value.codigoPostal,
        line1: this.pagoForm.value.calle,
        line2: this.pagoForm.value.numero,
        state: this.pagoForm.value.estado,
        country_code: this.countryCode,
      }
    };
    if (!this.validarNumeroTarjeta(this.cardNumber)) {
      const el = document.getElementById('cardNumber');

      if (el) {
        el.classList.add('input-error');
      }

      this.validateCardNumber = true;
      return;
    } else {
      const el = document.getElementById('cardNumber');
      if (el) {
        el.classList.remove('input-error');
      }
      this.validateCardNumber = false;

    }
    if (!this.validarCVC(this.cvv2, this.cardNumber)) {
      const el = document.getElementById('cvv2');
      if (el) {
        el.classList.add('input-error');
      }
      this.validateCvv2 = true;
      return;
    } else {
      const el = document.getElementById('cvv2');
      if (el) {
        el.classList.remove('input-error');
      }
      this.validateCvv2 = false;
    }
    // if (this.me == null || this.me == undefined) {
    //   this.swal.info('Favor de ingresar a su cuenta para proceder con la compra');
    //   return;

    // }
    // if (this.saleEvent.mode == 'mifel') {
    //   this.tickets.forEach(ticket => {
    //     ticket.promocode = 'PREVENTA-MIFEL'
    //   });
    // }
    this.boleto.holdToken = this.holdToken;
    this.boleto.evento = this.idEvento;
    this.boleto.plan = 1;
    this.boleto.subtotal = this.subtotal;
    if (this.desgloseComision) {
      this.boleto.comision = this.desgloseComision.comision;
    }
    this.boleto.tickets = this.tickets;
    this.boleto.pais = this.pagoForm.value.country;
    this.boleto.estado = this.pagoForm.value.state;
    this.boleto.ciudad = this.pagoForm.value.city;
    this.boleto.descriptionEvento = this.saleEvent.name;
    this.boleto.address1 = formObject.address.line1;
    this.boleto.address2 = formObject.address.line2;
    this.boleto.formObject = formObject;
    this.boleto.deviceDataId = this.deviceDataId;
    this.boleto.nombre_titular = this.pagoForm.value.holderName;
    this.boleto.email_titular = this.pagoForm.value.email;
    this.boleto.telefono = this.pagoForm.value.telefono;
    this.boleto.telefono_titular = this.pagoForm.value.telefono;
    this.boleto.event_date = this.saleEvent.event_date;
    this.boleto.event_time = this.saleEvent.event_time;
    this.boleto.image_event_online = this.saleEvent.image_event_online;
    this.boleto.short_description = this.saleEvent.short_description;
    this.boleto.enclosure_name = this.saleEvent.enclosure_name;
    this.boleto.fechaCompra = this.fechaCompra;
    this.boleto.checkDireccion = this.checkDireccion;
    this.boleto.codigoPostal = this.pagoForm.value.postalCode;
    this.boleto.vendedor = this.pagoForm.value.vendedor;
    //return;
    this.boleto.user_id = localStorage.getItem('user_id') ? localStorage.getItem('user_id') : '0';

  }
  pagarConBancomer() {
    if (this.pagoForm.valid) {
      let address1 = {
        city: this.city,
        line3: '.',
        postal_code: this.pagoForm.value.postalCode,
        line1: this.pagoForm.value.street,
        line2: this.pagoForm.value.numberHome,
        state: this.pagoForm.value.state,
        country_code: this.pagoForm.value.country,
      }
      let country = this.listCountries.filter((x: { id: any; }) => x.id == this.pagoForm.value.country)[0];
      this.boleto.pais = country ? country.name : null;
      let state = this.listStates.filter((x: { id: any; }) => x.id == this.pagoForm.value.state)[0];
      this.boleto.holdToken = this.holdToken;
      this.boleto.evento = this.idEvento;
      this.boleto.plan = 1;
      this.boleto.subtotal = this.subtotal;
      if (this.desgloseComision) {
        this.boleto.comision = this.desgloseComision.comision;
      }
      this.boleto.tickets = this.tickets;
      this.boleto.address1 = address1.line1;
      this.boleto.address2 = address1.line2;
      this.boleto.pais = this.pagoForm.value.country;
      this.boleto.estado = this.pagoForm.value.state;
      this.boleto.ciudad = this.pagoForm.value.city;
      this.boleto.descriptionEvento = this.saleEvent.name;
      this.boleto.deviceDataId = this.deviceDataId;
      this.boleto.nombre_titular = this.pagoForm.value.holderName;
      this.boleto.email_titular = this.pagoForm.value.email;
      this.boleto.telefono = this.pagoForm.value.telefono;
      this.boleto.telefono_titular = this.pagoForm.value.telefono;
      this.boleto.event_date = this.saleEvent.event_date;
      this.boleto.event_time = this.saleEvent.event_time;
      this.boleto.image_event_online = this.saleEvent.image_event_online;
      this.boleto.short_description = this.saleEvent.short_description;
      this.boleto.enclosure_name = this.saleEvent.enclosure_name;
      this.boleto.fechaCompra = this.fechaCompra;
      this.boleto.user_id = localStorage.getItem('user_id') ? localStorage.getItem('user_id') : '0';
      this.boleto.vendedor = this.pagoForm.value.vendedor;

      // const modalOptions: ModalOptions = {
      //   initialState: { contentHtml: this.boleto },
      //   class: 'modal-lg', backdrop: 'static', keyboard: false,
      // }
      // this.loaderService.hideLoader();

      // this.ngxModalRef = this.ngxModalService.show(TerminosPayComponent, modalOptions);
      // this.ngxModalRef.onHidden.subscribe((response) => {

      // });
    } else {
      //this.loaderService.hideLoader();
      if (this.pagoForm.value.holderName == undefined || this.pagoForm.value.holderName == '') {
        const el = document.getElementById('holderNameBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateHolderName = true;

      } else {
        const el = document.getElementById('holderNameBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
      }
      if (this.pagoForm.value.telefono == undefined || this.pagoForm.value.telefono == '') {
        const el = document.getElementById('telefonoBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateTelefono = true;

      } else {
        const el = document.getElementById('telefonoBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateTelefono = false;
      }
      if (this.pagoForm.value.email == undefined || this.pagoForm.value.email == '') {
        const el = document.getElementById('emailBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateEmail = true;

      } else {
        const el = document.getElementById('emailBancomer')
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateEmail = false;
      }
      if (this.pagoForm.value.street == undefined || this.pagoForm.value.street == '') {
        const el = document.getElementById('streetBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateStreet = true;

      } else {
        const el = document.getElementById('streetBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateStreet = false;
      }
      if (this.pagoForm.value.numberHome == undefined || this.pagoForm.value.numberHome == '') {
        const el = document.getElementById('numberHomeBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateNumberHome = true;

      } else {
        const el = document.getElementById('numberHomeBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateNumberHome = false;
      }
      if (this.pagoForm.value.postalCode == undefined || this.pagoForm.value.postalCode == '') {
        const el = document.getElementById('postalCodeBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validatePostalCode = true;

      } else {
        const el = document.getElementById('postalCodeBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validatePostalCode = false;

      }
      if (this.pagoForm.value.country == undefined || this.pagoForm.value.country == '') {
        const el = document.getElementById('countryBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateCountry = true;

      } else {
        const el = document.getElementById('countryBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateCountry = false;

      }
      if (this.pagoForm.value.state == undefined || this.pagoForm.value.state == '') {
        const el = document.getElementById('stateBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateState = true;

      } else {
        const el = document.getElementById('stateBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateState = true;

      }
      if (this.pagoForm.value.city == undefined || this.pagoForm.value.city == '') {
        const el = document.getElementById('cityBancomer');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateCity = true;

      } else {
        const el = document.getElementById('cityBancomer');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateCity = false;
      }
    }
  }
  pagarConOxxo() {
    if (this.pagoForm.valid) {
      //this.loaderService.showLoader();

      this.tickets.forEach(element => {
        element.subtotalOxxo = parseInt(element.subtotal) + element.comision;
      });
      this.boleto.holdToken = this.holdToken;
      this.boleto.evento = this.idEvento;
      this.boleto.plan = 1;
      this.boleto.subtotal = this.subtotal;
      if (this.desgloseComision) {
        this.boleto.comision = this.desgloseComision.comision;
      }
      this.boleto.tickets = this.tickets;
      this.boleto.pais = this.me ? this.me.country : 'Mexico';
      this.boleto.estado = this.me ? this.me.state : 'Yucatán';
      this.boleto.ciudad = this.pagoForm.value.city;
      this.boleto.descriptionEvento = this.saleEvent.name;
      // this.boleto.formObject = formObject;
      this.boleto.deviceDataId = this.deviceDataId;
      this.boleto.nombre_titular = this.pagoForm.value.holderName;
      this.boleto.email_titular = this.pagoForm.value.email;
      this.boleto.telefono = this.pagoForm.value.telefono;
      this.boleto.telefono_titular = this.pagoForm.value.telefono;
      this.boleto.event_date = this.saleEvent.event_date;
      this.boleto.event_time = this.saleEvent.event_time;
      this.boleto.image_event_online = this.saleEvent.image_event_online;
      this.boleto.short_description = this.saleEvent.short_description;
      this.boleto.enclosure_name = this.saleEvent.enclosure_name;
      this.boleto.fechaCompra = this.fechaCompra;
      this.boleto.checkDireccion = this.checkDireccion;
      this.boleto.codigoPostal = this.pagoForm.value.postalCode;
      //this.boleto.idUser = this.me.id;
      this.boleto.forma_pago = 'Efectivo';
      this.boleto.vendedor = this.pagoForm.value.vendedor;

      //return;
      this.eventoService.prebookOxxo(this.boleto).subscribe((r) => {
        this.boleto.ordenId = r.ordenId;
        const lineItems = this.tickets.map(ticket => {
          const desglose = this.addComisionConIVA('OXXO', 1, ticket.subtotalOxxo);
          const comision = desglose.comision;
          const monto = desglose.monto;
          return {
            brand: ticket.name,
            description: `Fila: ${ticket.fila}, Asiento: ${ticket.asiento}`,
            name: `${ticket.label}`,
            quantity: ticket.cantidad,
            unit_price: Math.round((comision + monto) * 100)
          };
        });
        const now = new Date();
        const oneHourFiftyMinutes = (1 * 60 * 60 * 1000) + (50 * 60 * 1000); // 1 hora y 50 minutos en milisegundos
        const updatedTime = new Date(now.getTime() + oneHourFiftyMinutes);
        const unixTimestamp = Math.floor(updatedTime.getTime() / 1000);
        const bodyApi = {
          order_template: {
            customer_info: {
              name: this.pagoForm.value.holderName,
              email: this.pagoForm.value.email,
              phone: this.pagoForm.value.telefono,
              corporate: true,
              object: 'customer_info'
            },
            "currency": "MXN",
            "line_items": lineItems,
            "metadata": {
              order_id: this.boleto.ordenId,
            }
          },
          recurrent: false,
          expires_at: unixTimestamp,
          name: this.boleto.ordenId + '-' + this.saleEvent.name,
          needs_shipping_contact: true,
          on_demand_enabled: true,
          payments_limit_count: 10,
          type: 'PaymentLink',
          allowed_payment_methods: ['cash'],
          order_id: this.boleto.ordenId,
          evento: this.boleto.evento
        };
        //return;
        this.conektaService.enviarDatos(bodyApi).subscribe(
          response => {
            var jsonThank = {
              'email_titular': this.boleto.email_titular,
              'ordenId': this.boleto.ordenId,
              'descriptionEvento': this.boleto.descriptionEvento,
              'event_date': this.boleto.event_date,
              'event_time': this.boleto.event_time,
              'enclosure_name': this.boleto.enclosure_name,
              'long_description': this.boleto.long_description,
              'tickets': this.boleto.tickets,
              'subtotal': this.subtotal,
              'comision': this.boleto.comision,
              'total': this.subtotal + this.boleto.comision,
              'image_event_online': this.boleto.image_event_online,
              'urlOpenpay': '',
              'urlOxxo': response.data.url,
              'expires_at': unixTimestamp
            }
            localStorage.setItem("saleData", JSON.stringify(jsonThank));
            this.router.navigate(['/boletos/venta/thankyoupage'], {
              queryParams: { data: JSON.stringify(this.boleto.ordenId) },
              state: { from: '/' }
            });
            //this.loaderService.hideLoader();
            //window.location.href = url;
          },
          (error: any) => {

          }
        );
      },
        (err: any) => {
          // this.loaderService.hideLoader();
          // this.alertService.error(err);
        }
      );
    } else {
      if (this.pagoForm.value.nombreTitular == undefined || this.pagoForm.value.nombreTitular == '') {
        const el = document.getElementById('holderNameOxxo');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateHolderName = true;

      } else {
        const el = document.getElementById('holderNameOxxo');
        if (el) {
          el.classList.remove('input-error');
        }
      }
      if (this.pagoForm.value.telefono == undefined || this.pagoForm.value.telefono == '') {
        const el = document.getElementById('telefonoOxxo');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateTelefono = true;

      } else {
        const el = document.getElementById('telefonoOxxo');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateTelefono = false;
      }
      if (this.pagoForm.value.email == undefined || this.pagoForm.value.email == '') {
        const el = document.getElementById('emailOxxo');
        if (el) {
          el.classList.add('input-error');
        }
        this.validateEmail = true;

      } else {
        const el = document.getElementById('emailOxxo');
        if (el) {
          el.classList.remove('input-error');
        }
        this.validateEmail = false;
      }

    }
  }
  validarNumeroTarjeta(numeroTarjeta: string): boolean {
    return OpenPay.card.validateCardNumber(numeroTarjeta);
  }

  validarCVC(cvc: string, numeroTarjeta: string): boolean {
    return OpenPay.card.validateCVC(cvc, numeroTarjeta);
  }

  validarExpiracion(mesExpiracion: string, anioExpiracion: string): boolean {
    return OpenPay.card.validateExpiry(mesExpiracion, anioExpiracion);
  }
  closeResumenModal() {
    this.isResumenModalVisible = false;
  }

  handleConfirmAndOpenTerms() {
    this.isResumenModalVisible = false; // Cierra el primer modal
    this.isTerminosModalVisible = true; // Abre el segundo modal
    if (this.pagoForm.valid) {
      this.dataCliente = { ...this.pagoForm.value };
      this.isTerminosModalVisible = true;
    }
    this.cdr.markForCheck(); // Asegura que la vista se actualice
  }

  closeTerminosModal() {
    this.isTerminosModalVisible = false;
  }
  recibirDataEventExtra(datos: any) {
    this.dataEventExtra = datos;
  }
  toggleSelection(option: any) {
    const metodo = option.value;
    this.pagoForm.get('metodoPago')?.setValue(metodo);

    if (metodo === 'Visa') {
      this.activarValidacionTarjeta();
    } else {
      this.desactivarValidacionTarjeta();
    }
    if (this.selectedOption === option.value) {
      this.selectedOption = '';
    } else {
      this.selectedOption = option.value;
    }
    this.addComisionConIVA(this.pasarela, 1, this.subtotal);
  }
  activarValidacionTarjeta() {
    const camposTarjeta = [
      'numeroTarjeta',
      'mesExp',
      'anoExp',
      'cvv',
      'calle',
      'numero',
      'codigoPostal',
      'ciudad',
      'estado',
      'pais',
    ];

    camposTarjeta.forEach((campo) => {
      const control = this.pagoForm.get(campo);
      control?.setValidators([Validators.required]);
      control?.updateValueAndValidity();
    });
  }
  desactivarValidacionTarjeta() {
    const camposTarjeta = [
      'numeroTarjeta',
      'mesExp',
      'anoExp',
      'cvv',
      'calle',
      'numero',
      'codigoPostal',
      'ciudad',
      'estado',
      'pais',
    ];

    camposTarjeta.forEach((campo) => {
      const control = this.pagoForm.get(campo);
      control?.clearValidators();
      control?.setValue('');
      control?.updateValueAndValidity();
    });
  }

  addComisionConIVA(pasarela: Pasarela, meses: number, importe: number) {
    let item = this.metodoPago[pasarela];
    let comision = item.cbase;
    const exerpexcerptcb = this.exerpexcerptcb;
    const importeComisioable = importe - exerpexcerptcb;
    let totalPagar = importe;
    let comisionConIVA = 0;

    if (importeComisioable > 0) {
      if (typeof item.cmeses !== 'undefined') {
        if (meses > 1 && typeof item.cmeses[meses] !== 'undefined') {
          comision += item.cmeses[meses];

        }
      }
      let IVA = (1 + this.tasaIVA / 100);
      let numerador = IVA * (importeComisioable * comision + item.cimporte);
      let denominador = (1 - comision * IVA);
      comision = numerador / denominador;
      comisionConIVA = comision;

      totalPagar = importe + comisionConIVA;
    }
    this.boleto.total = Math.round(totalPagar * 100) / 100;
    this.desgloseComision = { comision: Math.round(comisionConIVA * 100) / 100, monto: importe };
    return this.desgloseComision;
  }
}