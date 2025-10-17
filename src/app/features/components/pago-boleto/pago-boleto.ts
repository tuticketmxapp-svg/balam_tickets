import { Component, OnInit } from '@angular/core';
import { InfoEvento } from '../../../shared/info-evento/info-evento';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago-boleto',
  standalone: true,
  imports: [InfoEvento, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './pago-boleto.html',
  styleUrls: ['./pago-boleto.css']
})
export class PagoBoleto implements OnInit {
  pagoForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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
      pais: ['', Validators.required],
      estado: ['', Validators.required],
      ciudad: ['', Validators.required],
    });
  }

  // Getter para un acceso más fácil a los controles del formulario en el template
  get f() { return this.pagoForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.pagoForm.invalid) {
      return; // Detiene el proceso si el formulario es inválido
    }

    // Aquí iría la lógica para procesar el pago
    console.log('Formulario válido, procesando pago...', this.pagoForm.value);
  }
}
