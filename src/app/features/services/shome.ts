import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/Ievento';
import { EventoDetalle } from '../models/evento-detalle.model';

@Injectable({
  providedIn: 'root'
})
export class SHome {
  private apiUrl = environment.apiV1;

  constructor(private http: HttpClient) { }

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}events/active?channel=online`);
  }

  getEventoById(id: string): Observable<EventoDetalle> {
    return this.http.get<EventoDetalle>(`${this.apiUrl}eventos/${id}`);
  }
}
