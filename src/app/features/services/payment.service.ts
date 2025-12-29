import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
declare var OpenPay: any;

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    constructor(private http: HttpClient,
        private errorHandler: ErrorHandlerService) {
        // OpenPay.setId('mcvtkowiidmjbwmv4rrs');
        // OpenPay.setApiKey('pk_eba568e97f8243c3a22ff18d2e229a5c');
        // OpenPay.setSandboxMode(false);

        OpenPay.setId(environment.OpenPay.Id);
        OpenPay.setApiKey(environment.OpenPay.ApiKey);
        OpenPay.setSandboxMode(environment.OpenPay.SandboxMode);
    }

    extractFormAndCreate(formObject: any, successCallback: any, errorCallback: any): void {
        OpenPay.token.extractFormAndCreate(formObject, successCallback, errorCallback);
    }
    charge(data: any) {
        return this.http.post<any>(`${environment.apiV1}pagos/charge`, data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    updateSale(id: any, data: any) {
        return this.http.put<any>(`${environment.apiV1}pagos/confirmOpenpay/${id}`, data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    sendEmail(data: any) {
        return this.http.post<any>(`${environment.apiV1}pagos/enviaBoletos`, data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    secure(data: any){
        return this.http.post<any>(`${environment.secure}openpayresponse`,data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
}