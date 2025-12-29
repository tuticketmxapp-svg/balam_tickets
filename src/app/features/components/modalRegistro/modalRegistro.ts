import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../../../../environments/environment';
import { LoginWebService } from '../../services/loginWeb.service';
import { LocalStorageService } from '../../services/UserDataService.service';

const app = initializeApp(environment.firebaseConfig);
getAnalytics(app);

const auth = getAuth();
const authFace = getAuth();
const provider = new GoogleAuthProvider();
const providerFace = new FacebookAuthProvider();

@Component({
  selector: 'app-modal-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modalRegistro.html',
})
export class ModalRegistroComponent implements OnInit {

  /** CONTROL DEL MODAL */
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  formulario: FormGroup;
  showPassword = false;
  showPasswordConfirm = false;

  user: any = {
    name: '',
    email: '',
    email2: '',
    password: '',
    password_confirmation: '',
    country: 'Mexico',
    state: '',
    city: '',
    verification_code: '',
    validate_code: false,
  };

  listCountries: any[] = [];
  listStates: any[] = [];
  listCities: any[] = [];

  private subscription = new Subscription();

  @ViewChild('menuList') menuList!: ElementRef;

  constructor(
    private loginService: LoginWebService,
    //private swal: SweetAlertService,
    private fb: FormBuilder,
    //private loaderService: LoaderService,
    private router: Router,
    private localStorageService: LocalStorageService,
    //private modalCommunicationService: ModalCommunicationService
  ) {
    this.formulario = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        email2: ['', Validators.required],
        password: ['', Validators.required],
        password_confirmation: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
      },
      {
        validators: [this.CoincidenValidator, this.ContraseñaValidator],
      }
    );
  }

  ngOnInit(): void {
    this.getCountries();
    this.chanceCountry('Mexico');
  }

  /** MODAL */
  closeModal(): void {
    this.visible = false;
    this.closed.emit();
  }

  /** VALIDADORES */
  CoincidenValidator(form: FormGroup) {
    return form.get('email')?.value === form.get('email2')?.value
      ? null
      : { correosNoCoinciden: true };
  }

  ContraseñaValidator(form: FormGroup) {
    return form.get('password')?.value ===
      form.get('password_confirmation')?.value
      ? null
      : { passwordNoCoinciden: true };
  }

  /** REGISTRO */
  registro(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const code = this.generateVerificationCode();
    this.user.verification_code = code;

    //this.loaderService.showLoader();

    this.subscription.add(
      this.loginService.register(this.user).subscribe({
        next: (u) => {
          //this.loaderService.hideLoader();
          //this.swal.success(u.message);

          localStorage.setItem('user_data', JSON.stringify(u.user));

          const storedSeats = JSON.parse(
            localStorage.getItem('selectedObjects') || 'null'
          );

        //   this.modalCommunicationService.notifyModalClosed(
        //     u.user,
        //     storedSeats
        //   );

          this.closeModal();
        },
        error: (err) => {
        //   this.loaderService.hideLoader();
        //   this.swal.error('Error', err.error?.error?.email);
        },
      })
    );
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

  /** DATA */
  getCountries() {
    this.subscription.add(
      this.loginService.getCountries().subscribe(c => this.listCountries = c)
    );
  }

  chanceCountry(country: any) {
    let id = 142;

    if (country?.target) {
      const selected = this.listCountries.find(
        c => c.name === country.target.value
      );
      if (selected) {
        this.user.country = selected.name;
        id = selected.id;
      }
    }

    this.subscription.add(
      this.loginService.getStates(id).subscribe(c => this.listStates = c)
    );
  }

  chanceStates(state: any) {
    const selected = this.listStates.find(
      s => s.name === state.target.value
    );

    if (!selected) return;

    this.user.state = selected.name;

    this.subscription.add(
      this.loginService.getCities(selected.id).subscribe(
        c => this.listCities = c
      )
    );
  }

  generateVerificationCode(length = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  }

  /** GOOGLE */
  signInWithGoogle(): void {
    const code = this.generateVerificationCode();

    signInWithPopup(auth, provider).then(result => {
      const user = result.user;

      this.loginService.verifyLogin({
        email: user.email,
        name: user.displayName,
        token: GoogleAuthProvider.credentialFromResult(result)?.accessToken,
        verification_code: code
      }).subscribe(() => {
        //this.swal.success('Usuario registrado con éxito');
        this.closeModal();
      });
    });
  }

  /** FACEBOOK */
  iniciarSesionConFacebook(): void {
    const code = this.generateVerificationCode();

    signInWithPopup(authFace, providerFace).then(result => {
      const user = result.user;

      this.loginService.verifyLogin({
        email: user.email,
        name: user.displayName,
        token: FacebookAuthProvider.credentialFromResult(result)?.accessToken,
        verification_code: code
      }).subscribe(() => {
        //this.swal.success('Bienvenido');
        this.closeModal();
      });
    });
  }
}
