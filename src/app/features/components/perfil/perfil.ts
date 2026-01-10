import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { LoginWebService } from '../../services/loginWeb.service';
import { SidebarClickService } from '../../services/sidebar-click.service';
import { CitiesService } from '../../services/cities.service';
import { LocalStorageService } from '../../services/UserDataService.service';
import { EventService } from '../../services/event.service';
import { PerfilService } from '../../services/perfil.service';

// Services
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule
  ],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  showPassword = false;
  showPasswordConfirm = false;

  formulario: FormGroup;

  user = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    country: '',
    state: '',
    city: '',
    lastname: '',
    telefono: '',
    cp:'',
    calle:'',
    numero:'',
    country_id:'',
    state_id:''
  };

  idUser: any;
  listCountries: any;
  listStates: any;
  listCities: any;

  userData: any;

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    //private swal: SweetAlertService,
    private loginService: LoginWebService,
    // private alertService: SweetAlertService,
    //private loaderService: LoaderService,
    private sidebarClickService: SidebarClickService,
    private citiesService: CitiesService,
    private localStorageService: LocalStorageService,
    private eventService: EventService,
    private cd: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group(
      {
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', Validators.required],
        telefono: ['', Validators.required],
        country: ['', Validators.required],
        state: ['', Validators.required],
        city: ['', Validators.required],
        password: [''],
        password_confirmation: [''],
        calle: [''],
        numero: [''],
        cp: ['']
      },
      { validators: [this.contrasenaValidator] }
    );
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem('user_id');
    this.getUser();
    this.getCountries();

    this.sidebarClickService.setMenuActive({
      title: 'Mi Perfil',
      icon: faUser
    });

    this.userData = JSON.parse(
      this.localStorageService.getItem('user_data') ?? ''
    );
  }

  contrasenaValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirmation')?.value;
    return password === confirm ? null : { passwordNoCoinciden: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm = !this.showPasswordConfirm;
  }

  getUser() {
    this.perfilService.getUser(this.idUser).subscribe(
      (u) => {
        this.user = { ...u };
        setTimeout(() => {
          if (this.user.country) {
            this.changeCountry(this.user.country);
            this.chanceStates(this.user.state);
          }
        });
        this.cd.detectChanges();
        console.log('this.user', this.user)
      },
      (error) => {
        console.error(error);
      }
    );
  }



  getCountries() {
    this.loginService.getCountries().subscribe(
      (countries) => {
        this.listCountries = countries;
      },
      //   () => this.loaderService.hideLoader()
    );
  }

  changeCountry(event: any) {
    let selectedCountryId: any;

    if (event?.type === 'change') {
      const selectedName = event.target.value;
      const country = this.listCountries.find((c: any) => c.name === selectedName);

      this.user.country = country.name;
      this.user.country_id = country.id;

      this.loginService.getStates(country.id).subscribe((states) => {
        this.listStates = states;
        this.user.state = states[0]?.name;
        this.user.state_id = states[0]?.id;
      });
    } else {
      setTimeout(() => {
        const country = this.listCountries.find((c: any) => c.name === event);
        this.user.country = country.name;

        this.loginService.getStates(country.id).subscribe((states) => {
          this.listStates = states;
          //this.loaderService.hideLoader();
        });
      }, 500);
    }
  }

  chanceStates(state: any) {
    setTimeout(() => {
      const selectedState =
        state?.type === 'change' ? state.target.value : state;

      const found = this.listStates.find((s: any) => s.name === selectedState);
      this.user.state = found.name;
      this.user.state_id = found.id;

      this.subscription.add(
        this.loginService.getCities(found.id).subscribe((cities) => {
          this.listCities = cities;
        })
      );
    }, 500);
  }

updateUser() {
  const payload: any = { ...this.user };

  if (!payload.password) {
    delete payload.password;
    delete payload.password_confirmation;
  }

  (['country', 'state', 'city'] as const).forEach(field => {
    if (payload[field] == null) {
      delete payload[field];
    }
  });

  this.perfilService.updateUser(this.idUser, payload).subscribe(
    (r) => {
      const user = { ...r.user, ...payload };
      localStorage.setItem('user_data', JSON.stringify(user));
      this.eventService.emitUserUpdated();
    }
  );
}


  newPassword() {
    if (!this.user.password || !this.user.password_confirmation) {
      //this.swal.error('Error', 'Debe completar ambos campos');
      return;
    }

    const payload = {
      email: this.user.email,
      password: this.user.password,
      password_confirmation: this.user.password_confirmation
    };

    //this.loaderService.showLoader();
    this.loginService.cambiarContrasena(payload).subscribe(
      (r) => {
        // this.loaderService.hideLoader();
        // this.swal.success('', r.message);
        this.user.password = '';
        this.user.password_confirmation = '';
      },
      (error) => {
        // this.loaderService.hideLoader();
        // this.swal.error('Error', error.error.error);
      }
    );
  }
}
