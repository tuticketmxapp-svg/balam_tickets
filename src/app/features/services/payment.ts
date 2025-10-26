import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SPayment {
    private apiUrl = environment.apiV1;
    errorHandler: any;

    constructor(private http: HttpClient) { }

    prebook(data: any) {
        let token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'responseType': "text" };
        return this.http.post<any>(`${environment.apiV1}salesOpenPay`, data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    getHolToken() {
        return this.http.get<any>(`${environment.apiV1}seats/holdToken`).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
}
