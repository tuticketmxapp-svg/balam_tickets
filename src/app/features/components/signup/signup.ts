import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

import { VerificationCodeComponent } from '../verificationCode/verificationCode';
import { environment } from '../../../../environments/environment';
import { LoginWebService } from '../../services/loginWeb.service';

/* ========== FIREBASE ========== */
const firebaseApp = initializeApp(environment.firebaseConfig);
getAuth(firebaseApp);
isSupported().then(s => s && getAnalytics(firebaseApp));

const auth = getAuth();
const authFace = getAuth();
const provider = new GoogleAuthProvider();
const providerFace = new FacebookAuthProvider();
/* ============================== */

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    VerificationCodeComponent
  ],
  templateUrl: './signup.html',
})
export class Signup implements OnInit {

  formulario!: FormGroup;
  showPassword = false;
  showPasswordConfirm = false;

  showVerificationModal = signal(false);
  dataLogin: any = null;

  user: any = {
    name: '',
    email: '',
    password: '',
    country: 'Mexico',
    state: '',
    city: '',
    verification_code: '',
  };

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private loginService: LoginWebService,
    // private swal: SweetAlertService,
    // private loader: LoaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formulario = this.fb.group(
      {
        name: ['', Validators.required],
        phone: ['', Validators.required],
        birth_date: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],

        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],

        password: ['', Validators.required],
        password_confirmation: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

  }
  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirmation')?.value;

    return password === confirm ? null : { passwordMismatch: true };
  }

  /* ================= VALIDADORES ================= */

  matchEmail(form: FormGroup) {
    return form.get('email')?.value === form.get('email2')?.value
      ? null
      : { emailMismatch: true };
  }

  matchPassword(form: FormGroup) {
    return form.get('password')?.value ===
      form.get('password_confirmation')?.value
      ? null
      : { passwordMismatch: true };
  }

  /* ================= REGISTRO ================= */

  registro() {
    console.log('entre a registro', this.formulario.valid);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.user = { ...this.user, ...this.formulario.value };
    this.user.verification_code = this.generateVerificationCode();

    //this.loader.showLoader();

    this.subscription.add(
      this.loginService.register(this.user).subscribe({
        next: () => {
          //this.loader.hideLoader();
          this.dataLogin = this.user;
          this.showVerificationModal.set(true);
        },
        error: (err) => {
          //this.loader.hideLoader();
          //this.swal.error('Error', err.error?.message);
        }
      })
    );
  }


  /* ================= GOOGLE ================= */

  signInWithGoogle() {
    const code = this.generateVerificationCode();

    signInWithPopup(auth, provider).then(result => {
      const credential =
        GoogleAuthProvider.credentialFromResult(result);
      if (!credential) return;

      const payload = {
        email: result.user.email,
        name: result.user.displayName,
        token: credential.accessToken,
        verification_code: code,
        google: true
      };

      this.loginService.verifyLogin(payload).subscribe(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    });
  }

  /* ================= FACEBOOK ================= */

  signInWithFacebook() {
    const code = this.generateVerificationCode();

    signInWithPopup(authFace, providerFace).then(result => {
      const credential =
        FacebookAuthProvider.credentialFromResult(result);
      if (!credential) return;

      const payload = {
        email: result.user.email,
        name: result.user.displayName,
        token: credential.accessToken,
        verification_code: code,
        google: true
      };

      this.loginService.verifyLogin(payload).subscribe(() => {
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    });
  }

  /* ================= UTIL ================= */

  generateVerificationCode(length = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  }

  closeVerification() {
    this.showVerificationModal.set(false);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
