import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { SHome } from '../../services/shome';
import { EventoDetalle } from '../../models/evento-detalle.model';
import { ResumenCompraModal } from './resumen-compra-modal';
import { TerminosCompraModal } from '../seleccion-boletos/terminos-compra-modal';

@Component({
  selector: 'app-pago-boleto',
  standalone: true,
  imports: [InfoEvento, RouterModule, ReactiveFormsModule, ResumenCompraModal, TerminosCompraModal],
  templateUrl: './pago-boleto.html', 
  styleUrls: ['./pago-boleto.css'],
})
export class PagoBoleto implements OnInit {
  pagoForm: FormGroup;
  submitted = false;
  evento: EventoDetalle | null = null; // Propiedad para almacenar los datos del evento
  isResumenModalVisible = false;
  isTerminosModalVisible = false;
  private cdr = inject(ChangeDetectorRef); // Inyectamos el ChangeDetectorRef

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sHome: SHome,
    private router: Router
  ) {
    this.pagoForm = this.fb.group({
      nombreTitular: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmarEmail: ['', Validators.required],
      numeroTarjeta: ['', Validators.required],
      mesExp: ['', Validators.required],
      anoExp: ['', Validators.required],
      cvv: ['', Validators.required],
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      pais: ['', Validators.required],
    }, { validators: this.emailCoincide });
  }

  // Getter para fácil acceso a los campos del formulario en la plantilla
  get f() { return this.pagoForm.controls; }

  emailCoincide(control: AbstractControl): ValidationErrors | null {
    const email = control.get('email')?.value;
    const confirmarEmail = control.get('confirmarEmail')?.value;
    return email === confirmarEmail ? null : { emailNoCoincide: true };
  }

  ngOnInit(): void {
    const urlEvent = this.route.snapshot.paramMap.get('url_event');
    if (urlEvent) {
      this.sHome.getEventoById(urlEvent).subscribe({
        next: (data) => {
          this.evento = data;
          this.cdr.markForCheck(); // Le decimos a Angular que revise los cambios
          console.log('Evento cargado en página de pago:', this.evento);
        },
        error: (err) => {
          console.error('Error al cargar el evento en la página de pago', err);
          this.router.navigate(['/']); // Redirigir a home si hay un error
        },
      });
    }
  }

  // ... resto de tu lógica para el formulario
  onSubmit() {
    /* this.submitted = true;

    if (this.pagoForm.invalid) {
      console.log('Formulario inválido');
      // Forzar la detección de cambios para mostrar los mensajes de error
      this.cdr.markForCheck();
      return;
    }

    console.log('Formulario válido, procesando pago...', this.pagoForm.value); */
    this.isResumenModalVisible = true;
  }

  closeResumenModal() {
    this.isResumenModalVisible = false;
  }

  handleConfirmAndOpenTerms() {
    this.isResumenModalVisible = false; // Cierra el primer modal
    this.isTerminosModalVisible = true; // Abre el segundo modal
    this.cdr.markForCheck(); // Asegura que la vista se actualice
  }

  closeTerminosModal() {
    this.isTerminosModalVisible = false;
  }
}