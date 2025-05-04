import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  private apiUrl = 'http://localhost:8000/api/lists'; // 🔹 Ruta del backend Laravel

  constructor(private http: HttpClient) {}

  getListas(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get(this.apiUrl, { headers });
  }

  getListaPorId(listaId: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get(`http://localhost:8000/api/lists/${listaId}`, { headers });
  }
}