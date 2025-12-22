import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TerminosCompraModal } from './terminos-compra-modal';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SHome } from '../../services/shome';
import { Evento } from '../../models/Ievento';
import { EventoDetalle } from '../../models/evento-detalle.model';
import { CalculadoraComisiones, MetodosPago } from '../../services/comision';
import { Meta } from '@angular/platform-browser';
import moment from 'moment';
import Swal from 'sweetalert2';
import { SPayment } from '../../services/payment';

interface Zone {
  description: any;
  current_stock: any;
  price: string | number;
  section: string;
  name: string;
  max_tickets: number;
  types: any;
}
interface TicketZoneItem {
  number: number;
  nameZone: string;
  min: number;
  max: number;
}
interface SelectedObject {
  id: string | number;
  type: string;
  price?: number;
  zone?: string;
  zone_id: string;
}

@Component({
  selector: 'app-seleccion-boletos',
  standalone: true,
  imports: [InfoEvento, CurrencyPipe, TerminosCompraModal, RouterModule],
  templateUrl: './seleccion-boletos.html',
  styleUrls: ['./seleccion-boletos.css'],
})
export class SeleccionBoletos implements OnInit {
  evento: EventoDetalle | null = null;
  isTerminosModalVisible = false;
  idEvento: any;
  filteredZones: Zone[] = [];
  maxOnline: number = 0;
  activeEvent = false;
  selectedObjects: SelectedObject[] = [];
  totalArray: number[] = [];
  ticketZone: Record<string, TicketZoneItem> = {};
  totalCobrar: number | undefined;
  holdToken: string | undefined;
  general = 1;
  urlEvento: string | undefined;
  private cdr = inject(ChangeDetectorRef); // Inyectamos el ChangeDetectorRef

  constructor(
    private route: ActivatedRoute,
    private sHome: SHome,
    private router: Router,
    private metaService: Meta,
    private sPayment: SPayment


  ) { }

  ngOnInit(): void {
    const urlEvent = this.route.snapshot.paramMap.get('url_event');
    this.urlEvento = urlEvent ?? undefined;
    const metodosPagoOpenPay: MetodosPago = {
      "Visa": {
        cbase: 0.029,
        cimporte: 2.5,
        cmeses: {
          3: 0.048, // 4.8% de comisión para transacciones de 3 meses
          6: 0.078, // 78% de comisión para transacciones de 6 meses
          9: 0.0108, // 108% de comisión para transacciones de 9 meses
          12: 0.0138, //13.8% de comisión para transacciones de 12 meses
        }
      },
      "Mastercard": {
        cbase: 0.029,
        cimporte: 2.5,
        cmeses: {
          3: 0.048,
          6: 0.078,
          9: 0.0108,
          12: 0.0138,
        }
      },
      'American Express': {
        cbase: 0.029,
        cimporte: 2.5,
        cmeses: {
          3: 0.038,
          6: 0.058,
          9: 0.078,
          12: 0.098,
        }
      },
      'TPV': {
        cbase: 0.03,
        cimporte: 0,
      },
    }
    const configOpenPay = {
      comisiones: metodosPagoOpenPay,
      tasaIVA: 16,
    }
    const calculadoraOpenPay = new CalculadoraComisiones(configOpenPay.comisiones, configOpenPay.tasaIVA);
    this.sHome.getHolToken().subscribe((data: any) => {
      console.log('data', data);
      this.holdToken = data.holdToken;

    });
    if (urlEvent) {
      this.sHome.getEventoById(urlEvent).subscribe({
        next: (data) => {
          if (data) {
            this.idEvento = data.id;
            const filteredList = data.zone_prices.filter(obj => obj.ticket_office === 1);
            console.log('filteredList', filteredList);
            let zonas: any = {};
            let max_tickets: number;
            let section: string;
            let description: string;
            let current_stock: number;
            let price: number;
            filteredList.forEach((zone: any) => {
              console.log('zone', zone);
              max_tickets = parseInt(zone.max_tickets);
              section = zone.section;
              description = zone.description;
              current_stock = zone.current_stock;
              price = zone.price;
              let importe = parseFloat(zone.price) + parseFloat(zone.commission);
              importe = parseFloat(importe.toFixed(2));
              let cargoServicio = calculadoraOpenPay.addComisionConIVA("Visa", 2, importe);
              const importeCobrar = importe + cargoServicio.comision;
              zone.selected = 0;

              if (!(zone.name in zonas)) {
                zonas[zone.name] = [];
              }

              zonas[zone.name].push(zone);

              if (typeof zone.types !== "undefined") {
                zone.types.forEach((type: any) => {
                  let typeZone = Object.assign({}, zone);
                  typeZone.selected = 0;
                  typeZone.comision = type.comision;
                  typeZone.online_commission = type.comision_online;
                  typeZone.type_id = type.id;
                  typeZone.type = type.name;
                  typeZone.price = type.price;
                  if (!(zone.name in zonas)) {
                    zonas[zone.name] = [];
                  }
                  zonas[zone.name].push(typeZone);
                  // zonas[zone.name].push({
                  //     ...zone,
                  //     max_tickets: type.max_tickets  // Se agrega max_tickets de cada zona
                  // });
                });
              }
            });
            console.log('zonas', zonas);
            let groupedZones = Object.keys(zonas).map(key => ({
              name: key, max_tickets: max_tickets, types: zonas[key], section: section, description: description, current_stock: current_stock, price: price
            }));
            this.filteredZones = groupedZones;

            console.log('this.filteredZones', this.filteredZones);
            this.evento = data;
            // 2. Establece las etiquetas de Open Graph para redes sociales
            // Usamos updateTag para asegurarnos de que se actualicen
            this.metaService.updateTag({ property: 'og:title', content: this.evento.name });
            this.metaService.updateTag({ property: 'og:description', content: this.evento.long_description });
            this.metaService.updateTag({ property: 'og:image', content: this.evento.image_event_banner });
            this.metaService.updateTag({ property: 'og:url', content: window.location.href }); // La URL actual de la página
            this.metaService.updateTag({ property: 'og:type', content: 'website' });

            // Opcional: También puedes añadir las etiquetas específicas para Twitter
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
            this.metaService.updateTag({ name: 'twitter:title', content: this.evento.name });
            this.metaService.updateTag({ name: 'twitter:description', content: this.evento.long_description });
            this.metaService.updateTag({ name: 'twitter:image', content: this.evento.image_event_banner });
            this.evento.event_time = this.evento.event_time.substring(0, this.evento.event_time.lastIndexOf(":"));
            var partesHora = this.evento.event_time.split(":");
            var horas = parseInt(partesHora[0]);
            var minutos = parseInt(partesHora[1]);
            var periodo = horas >= 12 ? "pm" : "am";
            horas = horas % 12;
            horas = horas ? horas : 12;
            var horaConAMPM = horas + ":" + (minutos < 10 ? "0" : "") + minutos + " " + periodo;
            this.evento.event_time = horaConAMPM;
            this.checkActive(data);
            this.maxOnline = data.max_boletos_online;

          } else {
            //this.swal.error("Error", "No se encontró el evento");
          }

          // Inicializamos la cantidad de boletos para cada zona
          this.evento?.zone_prices.forEach((zona) => (zona.cantidad = 0));
          this.cdr.markForCheck(); // Le decimos a Angular que revise los cambios
        },
        error: (err) => {
          console.error('Error al cargar el evento', err);
          // Opcional: Redirigir a una página de error o a home
          this.router.navigate(['/']);
        },
      });
    }
  }
  checkActive(event: EventoDetalle) {
    if (event.sale_channel_online === 1 && event.map_enabled == 0) {
      const today = moment();
      const startDate = moment(event.online_sale_from);
      const endDate = moment(event.online_sale_to);
      if (today.isBetween(startDate, endDate)) {
        this.activeEvent = true;
      }
    }
    if (event.id == 208) {
      this.activeEvent = true;

    }

  }
  // Funciones para el contador
  incrementar(boleto: any) {
    const boletosEnZona = this.selectedObjects.filter(obj => obj.zone_id === boleto.id).length;
    const totalBoletosEnZona = boletosEnZona + (boleto.multiple ? boleto.multiple : 1);
    if (totalBoletosEnZona > parseInt(boleto.max)) {
      //this.alertService.error("No se pueden agregar más elementos. Se alcanzó el máximo permitido por zona.");
      return;
    }

    if (boleto.multiple && boleto.multiple > 0) {
      for (let i = 0; i < boleto.multiple; i++) {
        if (this.selectedObjects.length >= this.maxOnline) {
          //this.alertService.error("No se pueden agregar más elementos. Se alcanzó el máximo permitido.");
          return;
        }
        const data = {
          general: boleto.general,
          zone_id: boleto.id,
          min: boleto.min,
          max: boleto.max,
          comision: boleto.online_commission,
          price: boleto.price,
          category: boleto.general,
          uuid: boleto.id,
          label: boleto.section !== null ? boleto.section : boleto.name,
          id: boleto.id,
          type: boleto.type,
          type_id: boleto.type_id,
          section: boleto.section,
          name: boleto.name,
          tipoMesa: false,
          cantidadArray: 1
        };
        this.selectedObjects.push(data);
        this.addTicketZoneCount(boleto.id, boleto.name, boleto.min, boleto.max, 'add');
        this.totalPrice(boleto.price, boleto.online_commission);
      }
      boleto.selected += boleto.multiple;
    } else {
      if (this.selectedObjects.length >= this.maxOnline) {
        //this.alertService.error("No se pueden agregar más elementos. Se alcanzó el máximo permitido.");
        return;
      }

      const data = {
        general: boleto.general,
        zone_id: boleto.id,
        min: boleto.min,
        max: boleto.max,
        comision: boleto.online_commission,
        price: boleto.price,
        category: boleto.general,
        uuid: boleto.id,
        label: boleto.section !== null ? boleto.section : boleto.name,
        id: boleto.id,
        type: boleto.type,
        type_id: boleto.type_id,
        name: boleto.name,

      };
      this.selectedObjects.push(data);
      this.addTicketZoneCount(boleto.id, boleto.name, boleto.min, boleto.max, 'add');
      this.totalPrice(boleto.price, boleto.online_commission);
      boleto.selected++;
    }
    localStorage.setItem("selectedObjects", JSON.stringify(this.selectedObjects));
    console.log('this.selectedObjects', this.selectedObjects);
  }

  decrementar(boleto: any) {
    if (boleto.selected <= 0) {
      //this.alertService.error("No se pueden disminuir más elementos. No hay elementos seleccionados.");
      return;
    }

    if (boleto.multiple && boleto.multiple > 0) {
      for (let i = 0; i < boleto.multiple; i++) {
        let index = this.selectedObjects.findIndex(obj => obj.id === boleto.id && obj.type === boleto.type);
        // return;
        if (index !== -1) {
          this.selectedObjects.splice(index, 1);
          this.totalArray.splice(index, 1);
          this.addTicketZoneCount(boleto.id, boleto.name, boleto.min, boleto.max, 'remove');
          this.totalPriceDecrement(this.totalArray);
        }
      }
      boleto.selected -= boleto.multiple;
    } else {
      let index = this.selectedObjects.findIndex(obj => obj.id === boleto.id);
      if (index !== -1) {
        this.selectedObjects.splice(index, 1);
        this.totalArray.splice(index, 1);
        this.addTicketZoneCount(boleto.id, boleto.name, boleto.min, boleto.max, 'remove');
        this.totalPriceDecrement(this.totalArray);
        boleto.selected--;
      }
    }

    localStorage.setItem("selectedObjects", JSON.stringify(this.selectedObjects));
  }
  addTicketZoneCount(id: string, name: string, min: string, max: string, mode: 'add' | 'remove') {
    if (mode === 'add') {
      if (!this.ticketZone[id]) {
        this.ticketZone[id] = {
          number: 1,
          nameZone: name,
          min: Number(min),
          max: Number(max)
        };
      } else {
        this.ticketZone[id].number += 1;
      }
    } else {
      if (!this.ticketZone[id]) return;

      this.ticketZone[id].number -= 1;

      if (this.ticketZone[id].number <= 0) {
        delete this.ticketZone[id];
      }
    }
  }
  totalPrice(precio: string, comision: string) {
    var suma = 0;
    let prec = parseFloat(precio);
    let com = parseFloat(comision);
    let subtotal = prec;
    this.totalArray.push(subtotal);
    for (var i = 0; i < this.totalArray.length; i++) {
      suma += this.totalArray[i];
    }
    this.totalCobrar = suma;
    return subtotal.toFixed(2);
  }
  totalPriceDecrement(totalArray: string | any[]) {
    var suma = 0;

    for (var i = 0; i < totalArray.length; i++) {
      suma += totalArray[i];
    }
    this.totalCobrar = suma;
  }
  get totalBoletosSeleccionados(): number {
    if (!this.evento) {
      return 0;
    }
    return this.evento.zone_prices.reduce((total, zona) => total + (zona.cantidad || 0), 0);
  }

  openTerminosModal() {
    this.isTerminosModalVisible = true;
  }

  closeTerminosModal() {
    this.isTerminosModalVisible = false;
  }
  goToSale() {

    // if (!this.me) {
    //   const modalOptions: ModalOptions = {
    //     class: 'modal-md',
    //     backdrop: 'static',
    //     keyboard: false,
    //   };

    //   this.ngxModalRef = this.ngxModalService.show(
    //     ModalLoginComponent,
    //     modalOptions
    //   );

    //   this.ngxModalRef.onHidden.subscribe(() => {
    //     const storedSelectedSeats = JSON.parse(
    //       localStorage.getItem('selectedObjects')
    //     );

    //     const userData = this.localStorageService.getItem('user_data');
    //     this.me = userData;

    //     this.modalCommunicationService.notifyModalClosed(
    //       userData,
    //       storedSelectedSeats
    //     );

    //     if (storedSelectedSeats) {
    //       this.selectedObjects = storedSelectedSeats;
    //     }
    //   });

    //   return;
    // }

    const ids = this.selectedObjects.map(obj => obj.id);
    if (ids.length === 0) {
      //this.swal.error('Error', 'Debe seleccionar al menos un asiento');
      return;
    }

    if (this.validateBeforeSale()) {
      return;
    }
    if (this.holdToken) {

      this.sPayment.setSale(this.selectedObjects, this.holdToken);
      this.sPayment.setEvent(this.evento, this.holdToken);
    }

    this.router.navigate(
      ['/pagoBoleto', this.urlEvento],
      {
        queryParams: {
          holdToken: this.holdToken,
          idEvento: this.idEvento,
          general: this.general
        }
      }
    );

  }
  validateBeforeSale() {
    const ObjTickets = Object.keys(this.ticketZone);
    let msg = '<ul>';
    let showAlert = false;
    let sum = 0;

    for (const key in this.ticketZone) {
      if (Object.hasOwnProperty.call(this.ticketZone, key)) {
        const element = this.ticketZone[key];
        sum += element.number;
      }
    }
    if (sum > this.maxOnline) {
      msg = `<li>El máximo permitido de Tickets a vender es de ${this.maxOnline}</li>`;
      showAlert = true;
    } else {
      for (const objT of ObjTickets) {

        if (this.ticketZone[objT].number < this.ticketZone[objT].min) {
          msg += '<li>La zona ' + this.ticketZone[objT].nameZone + ' debe tene como mínimo: ' + this.ticketZone[objT].min + ' asientos seleccionados</li>';
          showAlert = true;
        }

        if (this.ticketZone[objT].number > this.ticketZone[objT].max) {
          msg += '<li>La zona ' + this.ticketZone[objT].nameZone + ' debe tene como máximo: ' + this.ticketZone[objT].max + ' asientos seleccionados</li>';
          showAlert = true;
        }
      }
    }
    msg += '</ul>';
    if (showAlert) {
      //this.swal.warning('Aviso', msg);
    }
    return showAlert;
  }
}
