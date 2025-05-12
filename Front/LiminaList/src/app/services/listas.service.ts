import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';

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

  getListaPorId(listaId: string): Observable<any> { // Cambiado a string
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('❌ No hay token de autenticación, redirigir al login.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ tareas: Tarea[] }>(`${this.apiUrl}/${listaId}`, { headers }); // Asegurar que listaId es string
  }

  crearLista(lista: Lista): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post(this.apiUrl, lista, { headers });
  }

  guardarCambiosLista(lista: Lista) {
    if (!lista) return; 

    this.http.put(`${this.apiUrl}/${lista.id}`, lista).subscribe({
      next: (response) => {
        console.log('✅ Lista guardada:', response);
      },
      error: (error) => {
        console.error('❌ Error al guardar la lista:', error);
      }
    });
}
}