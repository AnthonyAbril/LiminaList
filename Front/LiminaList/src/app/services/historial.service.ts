import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProgresoDia {
  fecha: string;
  tareas: { id: number; titulo: string; progreso: number }[];
}

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private api = 'http://localhost:8000/api';
  constructor(private http: HttpClient) {}

  private authOpts() {
    const token = localStorage.getItem('token')||'';
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) };
  }

  getRoot(): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>(`${this.api}/historial-progreso`, this.authOpts());
  }
  getChildren(tareaId: number): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>(`${this.api}/historial-progreso/${tareaId}`, this.authOpts());
  }
}
