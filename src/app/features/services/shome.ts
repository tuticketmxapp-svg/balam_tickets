import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SHome {
  private apiUrl = environment.apiV1; 

  constructor(private http: HttpClient) { }

  getEventos() {
    return this.http.get(`${this.apiUrl}events/active?channel=online`);
  }
  
}
