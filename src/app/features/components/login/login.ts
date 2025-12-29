import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { LoginWebService } from '../../services/loginWeb.service';
import { LocalStorageService } from '../../services/UserDataService.service';
import { FirebaseService } from '../../services/firebaseService.service';

import { CookieService } from 'ngx-cookie-service';

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';

import { environment } from '../../../../environments/environment';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

/* ================= FIREBASE INIT ================= */

export const firebaseApp = initializeApp(environment.firebaseConfig);
export const auth = getAuth(firebaseApp);
export const provider = new GoogleAuthProvider();
export const providerFace = new FacebookAuthProvider();

export const analyticsPromise = isSupported().then(supported =>
  supported ? getAnalytics(firebaseApp) : null
);

/* ================= COMPONENT ================= */

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, OnDestroy {

  private subscription = new Subscription();

  userLogin = {
    email: '',
    password: ''
  };

  showPassword = false;

  @Output() loggedIn = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private loginService: LoginWebService,
    private router: Router,
    private firebaseService: FirebaseService,
    private cookie: CookieService,
    private userDataService: LocalStorageService
  ) { }

  /* ================= LIFECYCLE ================= */

  ngOnInit(): void {
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /* ================= LOGIN NORMAL ================= */

  login(): void {
    this.subscription.add(
      this.authService.login(this.userLogin).subscribe({
        next: (response: any) => {
          localStorage.setItem('user_data', JSON.stringify(response.user));
          localStorage.setItem('user_id', response.user.id);
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('access_token', response.access_token);

          this.cookie.set('access_token', response.access_token, 2, '/');
          this.userDataService.setUser(response.user);

          this.router.navigate(['/dashboard/mis-eventos'], { replaceUrl: true }).then(() => {
            // Forzar recarga completa de la página
            window.location.reload();
          });
        },
        error: () => {

        }
      })
    );
  }

  /* ================= GOOGLE LOGIN ================= */

  signInWithGoogle(): void {
    const code = this.generateVerificationCode();

    signInWithPopup(auth, provider)
      .then(result => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) return;

        const verifyLogin = {
          email: result.user.email,
          name: result.user.displayName,
          token: credential.accessToken,
          verification_code: code,
          google: true
        };

        this.subscription.add(
          this.loginService.verifyLogin(verifyLogin).subscribe({
            next: (u: any) => {
              localStorage.setItem('user_data', JSON.stringify(u.user));
              localStorage.setItem('user_id', u.user.id);
              localStorage.setItem('token', u.access_token);
              localStorage.setItem('access_token', u.access_token);

              this.cookie.set('access_token', u.access_token, 2, '/');
              this.userDataService.setUser(u.user);

              this.router.navigate(['/dashboard/mis-eventos'], { replaceUrl: true }).then(() => {
                // Forzar recarga completa de la página
                window.location.reload();
              });
            }
          })
        );
      });
  }

  /* ================= UTILS ================= */

  generateVerificationCode(length = 6): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length })
      .map(() => charset[Math.floor(Math.random() * charset.length)])
      .join('');
  }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('user_data') ?? 'null');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  registro(): void {
    this.router.navigate(['registro']);
  }

  forgetPassword(): void {
    this.router.navigate(['/login/forgotPassword']);
  }
}

