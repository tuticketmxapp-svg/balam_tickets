import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    getAuth,
    signInWithPopup
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { LoginWebService } from '../../services/loginWeb.service';
import { FirebaseService } from '../../services/firebaseService.service';
import { LocalStorageService } from '../../services/UserDataService.service';



// Firebase init
const app = initializeApp(environment.firebaseConfig);
getAnalytics(app);

const auth = getAuth();
const authFace = getAuth();
const provider = new GoogleAuthProvider();
const providerFace = new FacebookAuthProvider();

@Component({
    selector: 'app-modal-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule
    ],
    templateUrl: './modalLogin.html',
    styleUrls: ['./modalLogin.css']
})
export class ModalLoginComponent implements OnInit, OnDestroy {

    // 🔹 Control del modal
    @Input() visible = false;
    @Output() close = new EventEmitter<void>();
    @Output() loggedIn = new EventEmitter<any>();

    private subscription = new Subscription();

    userLogin = {
        email: '',
        password: ''
    };

    loginForm!: FormGroup;
    showPassword = false;
    user: SocialUser | null = null;

    constructor(
        private auth: AuthService,
        //private swal: SweetAlertService,
        private cdr: ChangeDetectorRef,
        private loginService: LoginWebService,
        //private loaderService: LoaderService,
        private router: Router,
        private authService: SocialAuthService,
        private facebookAuthService: FacebookAuthProvider,
        private firebaseService: FirebaseService,
        private formBuilder: FormBuilder,
        private localStorageService: LocalStorageService,
        private cookie: CookieService,
        private userDataService: LocalStorageService
    ) { }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    closeModal(): void {
        this.visible = false;
        this.close.emit();
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
        this.cdr.detectChanges();
    }

    login(): void {
        //this.loaderService.showLoader();

        this.subscription.add(
            this.loginService.login(this.userLogin).subscribe({
                next: (u) => {
                    this.loginService.setToken(u.access_token);
                    //this.swal.success('Bienvenido');

                    this.loginService.getMe().subscribe({
                        next: (me) => {
                            localStorage.setItem('user_data', JSON.stringify(me.data));
                            this.loggedIn.emit(me.data);
                            this.closeModal();
                        },
                        error: (err) => {
                            //this.swal.error(err.error.error, err.error.message);
                        }
                    });

                    //this.loaderService.hideLoader();
                },
                error: (err) => {
                    //   this.loaderService.hideLoader();
                    //   this.swal.error(err.error.error, err.error.message);
                }
            })
        );
    }

    generateVerificationCode(length: number = 6): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
    }

    signInWithGoogle(): void {
        const code = this.generateVerificationCode();

        signInWithPopup(auth, provider).then(result => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            const user = result.user;

            const verifyLogin = {
                email: user.email,
                name: user.displayName,
                token,
                verification_code: code,
                google: true
            };

            this.subscription.add(
                this.loginService.verifyLogin(verifyLogin).subscribe({
                    next: (u) => {
                        localStorage.setItem('user_data', JSON.stringify(u.user));
                        localStorage.setItem('access_token', u.access_token);
                        this.cookie.set('access_token', u.access_token, 2, '/');
                        this.userDataService.setUser(u.user);
                        this.loggedIn.emit(u.user);
                        this.closeModal();
                    },
                    error: (err) => {
                        //this.swal.error(err.error.error, err.error.message);
                    }
                })
            );
        });
    }

    iniciarSesionConFacebook(): void {
        const code = this.generateVerificationCode();

        signInWithPopup(authFace, providerFace).then(result => {
            const user = result.user;
            const credential = FacebookAuthProvider.credentialFromResult(result);

            const verifyLogin = {
                email: user.email,
                name: user.displayName,
                token: credential?.accessToken,
                verification_code: code
            };

            this.subscription.add(
                this.loginService.verifyLogin(verifyLogin).subscribe({
                    next: () => {
                        //this.swal.success('Bienvenido');
                        this.closeModal();
                    },
                    error: (err) => {
                        //this.swal.error(err.error.error, err.error.message);
                    }
                })
            );
        });
    }

    goToRegistro(): void {
        this.closeModal();
        this.router.navigate(['registro']);
    }

    goToPassword(): void {
        this.closeModal();
        this.router.navigate(['password']);
    }
}
