import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginWebService } from '../../services/loginWeb.service';
import { LocalStorageService } from '../../services/UserDataService.service';

@Component({
  selector: 'app-verification-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificationCode.html',
  styleUrls: ['./verificationCode.css']
})
export class VerificationCodeComponent implements OnInit {

  // ===== INPUTS (antes initialState)
  @Input() email!: string;
  @Input() google = false;
  @Input() dataLogin: any;
  @Input() dataRegistro: any;

  // ===== OUTPUTS (antes ngxModalRef)
  @Output() closed = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();

  codigo = '';
  rutaActual = '';

  constructor(
    private loginService: LoginWebService,
    private localStorageService: LocalStorageService,
    //private loaderService: LoaderService,
    //private swal: SweetAlertService,
    private router: Router
  ) {
    this.rutaActual = this.router.url;
  }

  ngOnInit(): void {}

  // ================== CERRAR ==================
  closeModal() {
    this.closed.emit();
  }

  // ================== VERIFICAR ==================
  verificar() {
    if (!this.codigo) {
      //this.swal.error('Favor de ingresar el código');
      return;
    }

    const json = {
      email: this.email,
      verification_code: this.codigo
    };

    //this.loaderService.showLoader();

    this.loginService.validarCodigo(json).subscribe({
      next: (resp: any) => {
        //this.loaderService.hideLoader();

        if (this.google) {
          const userData =
            this.dataLogin ??
            JSON.parse(this.localStorageService.getItem('user_data') ?? 'null');

          if (this.rutaActual === '/registro') {
            //this.swal.success(resp.message);
            this.closeModal();
            this.router.navigate(['/login']);
            return;
          }

          this.loginService.getMe().subscribe({
            next: (u: any) => {
              localStorage.setItem('user_data', JSON.stringify(u.data));
              this.verified.emit();
              this.router.navigate(['user/proximos/eventos'], { replaceUrl: true });
            },
            // error: err =>
            //   //this.swal.error(err.error?.error, err.error?.message)
          });

        } else {
          this.closeModal();
          this.router.navigate(['/login']);
        }

        if (
          this.rutaActual === '/user/proximos/eventos' ||
          this.rutaActual === '/login'
        ) {
          this.loginService.getMe().subscribe({
            next: (u: any) => {
              localStorage.setItem('user_data', JSON.stringify(u.data));
              this.verified.emit();
            },
            // error: err =>
              //this.swal.error(err.error?.error, err.error?.message)
          });

          this.router.navigate(['/user/proximos/eventos']);
        }
      },
      error: error => {
        // this.loaderService.hideLoader();
        // this.swal.error('Error', error.error?.message);
      }
    });
  }

  // ================== VERIFICAR DESPUÉS ==================
  verificarDespues() {
    this.closeModal();

    switch (this.rutaActual) {
      case '/login':
        this.router.navigate(['/login']);
        break;
      case '/user/proximos/eventos':
        this.router.navigate(['/user/proximos/eventos']);
        break;
    }
  }

  // ================== REENVIAR CÓDIGO ==================
  envioCodigo() {
    //this.loaderService.showLoader();

    const userData = JSON.parse(
      this.localStorageService.getItem('user_data') ?? 'null'
    );

    const json = {
      email: this.email,
      name: userData?.name
    };

    this.loginService.sentEmailCode(json).subscribe({
      next: () => {
        // this.loaderService.hideLoader();
        // this.swal.success('Código enviado al correo', this.email);
      },
      //error: () => this.loaderService.hideLoader()
    });
  }
}
