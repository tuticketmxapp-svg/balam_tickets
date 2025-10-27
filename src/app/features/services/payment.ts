import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SPayment {
    private apiUrl = environment.apiV1;
    errorHandler: any;

    constructor(private http: HttpClient) { }

    prebook(data: any) {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        return this.http.post<any>(`${environment.apiV1}salesOpenPay`, data, { headers })
            .pipe(
                catchError(this.handleError) 
            );
    }
    private handleError = (error: any) => {
        console.error('Error en prebook:', error);
        return throwError(() => error);
    };
    getHolToken() {
        return this.http.get<any>(`${environment.apiV1}seats/holdToken`).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    validarCodigo(payload: { email: string, codigo_verificacion: string }) {
        return this.http.post<any>(`${environment.apiV1}validate-code`, payload)
            .pipe(
                catchError(err => {
                    console.error('Error al validar código:', err);
                    return throwError(() => err);
                })
            );
    }
}
