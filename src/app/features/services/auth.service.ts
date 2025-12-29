import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public token = '';
    constructor(
        private http: HttpClient,
        private router: Router,
        private cookie: CookieService,
        private errorHandler: ErrorHandlerService
    ) { }

    login(data: any) {
        return this.http.post<any>(`${environment.apiV1}login/web`, data).pipe(catchError(error => this.errorHandler.handleError(error)));
    }
    public get currentToken() {
        return this.cookie.get('access_token');
    }
    getAuthToken(): string | null {
        return this.cookie.get('access_token');
    }
    public get userData() {
        return JSON.parse(localStorage.getItem('user_data') ?? 'null');
    }
    isLoggedIn(): boolean {
        const access_token = localStorage.getItem('access_token');

        if (access_token && access_token !== 'undefined') {
            return true;
        } else {
            return false;
        }
    }

    checkSession(): Observable<boolean> {
        return this.http.get<any>(`${environment.apiV1}client/validateToken`).pipe(
            map(response => {
                if (response && response.valid) {
                    return true;
                } else {
                    this.logout();
                    return false;
                }
            }),
            catchError(error => {
                console.error('Error al verificar la sesión:', error);
                this.logout();
                return of(false);
            })
        );
    }
    logout() {
        this.cookie.delete('access_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
    }
}
