import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Pasarela } from './types';
export interface MetodoPagoItem {
    cbase: number,
    cimporte: number,
    cmeses?: {
        [key: number]: number;
    };
}
export interface MetodosPago {
    [key: string]: MetodoPagoItem,
}
interface DesgloseIva { subtotal: number, iva: number, ivaper: number, total: number, cargo: number };
interface CalculoCargo { comision: number, monto: number }

export class Comision {
    private metodoPago: MetodosPago;
    private tasaIVA: number;

    constructor(metoPago: MetodosPago, tasaIVA: number) {
        this.metodoPago = metoPago;
        this.tasaIVA = tasaIVA;
    }
    calcularComision(pasarela: Pasarela, meses: number, importe: number): number {
        if (!(pasarela in this.metodoPago)) {
            throw new Error('La pasarela especificada no existe.');
        }
        let item = this.metodoPago[pasarela];
        let comision = item.cbase;
        if (typeof item.cmeses !== 'undefined') {
            for (const mesesComision in item.cmeses) {
                if (meses >= +mesesComision) {
                    comision += item.cmeses[mesesComision];
                } else {
                    break;
                }
            }
        }

        comision = importe * comision + item.cimporte;
        return comision;
    }
    calcularComisionConIVA(pasarela: Pasarela, meses: number, importe: number): CalculoCargo {
        const comision = this.calcularComision(pasarela, meses, importe);
        let comisionConIVA = comision * (1 + this.tasaIVA / 100);
        comisionConIVA = Math.ceil(comisionConIVA * 100) / 100;
        return { comision: comisionConIVA, monto: importe };
    }
    addComisionConIVA(pasarela: Pasarela, meses: number, importe: number): CalculoCargo {
        if (!(pasarela in this.metodoPago)) {
            throw new Error('La pasarela especificada no existe.');
        }
        let item = this.metodoPago[pasarela];
        let comision = item.cbase;
        if (typeof item.cmeses !== 'undefined') {
            for (const mesesComision in item.cmeses) {
                if (meses >= +mesesComision) {
                    comision += item.cmeses[mesesComision];
                } else {
                    break;
                }
            }
        }
        let IVA = (1 + this.tasaIVA / 100);
        let numerador = IVA * (importe * comision + item.cimporte);
        let denominador = (1 - comision * IVA);
        comision = numerador / denominador;
        let comisionConIVA = Math.ceil(comision * 100) / 100;
        return { comision: comisionConIVA, monto: importe };
    }
    desgloseIVA(cantidad: number): DesgloseIva {
        const subtotal = cantidad / (1 + this.tasaIVA / 100);
        const iva = cantidad - subtotal;
        const cargo = iva + subtotal;
        return {
            total: parseFloat(cantidad.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            cargo: parseFloat(cargo.toFixed(2)),
            iva: parseFloat(iva.toFixed(2)),
            ivaper: this.tasaIVA
        };
    }
}

export class CalculadoraComisiones extends Comision {
    configOpenPay: any;
    constructor(
        metodosPago: MetodosPago,
        tasaIVA: number,
    ) {
        super(metodosPago, tasaIVA);
    }
    override calcularComision(pasarela: Pasarela, meses: number, importe: number): number {
        return super.calcularComision(pasarela, meses, importe);
    }

    override calcularComisionConIVA(pasarela: Pasarela, meses: number, importe: number): CalculoCargo {
        return super.calcularComisionConIVA(pasarela, meses, importe);
    }
    override desgloseIVA(cantidad: number): DesgloseIva {
        return super.desgloseIVA(cantidad);
    }
}
