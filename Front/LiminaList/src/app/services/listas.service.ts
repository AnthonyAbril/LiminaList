import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';

@Injectable({
  providedIn: 'root'
})
export class ListasService {
  private apiUrl = 'http://localhost:8000/api/lists'; // 🔹 Ruta del backend Laravel

  constructor(private http: HttpClient) {}

  getListas(): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token, redirigiendo al login.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}?tipo=individual`, { headers }).pipe( // 🔹 Agregar el filtro de `tipo=individual`
      catchError(error => {
        console.error('❌ Error al obtener listas:', error);
        return throwError(() => error);
      })
    );
  }

  getListaPorId(listaId: string): Observable<any> { // Cambiado a string
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error('❌ No hay token de autenticación, redirigir al login.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${listaId}`, { headers }).pipe(
      catchError(error => {
        console.error('❌ Error al obtener lista:', error);
        return throwError(() => error);
      })
    );

  }

  crearLista(lista: Lista): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post(this.apiUrl, lista, { headers });
  }

  guardarCambiosLista(lista: Lista): Observable<any> {
    if (!lista) {
      console.warn('⚠ No hay lista para guardar.');
      return throwError(() => new Error('Lista vacía'));
    }

    return this.http.put(`${this.apiUrl}/${lista.id}`, lista).pipe(
      tap(response => console.log('✅ Lista guardada:', response)),
      catchError(error => {
        console.error('❌ Error al guardar la lista:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarLista(id: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}`, datos, { headers }).pipe(
      catchError(error => {
        console.error('❌ Error al actualizar lista:', error);
        return throwError(() => error);
      })
    );
  }

  filtrarListas(query: string): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token, redirigiendo al login.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}?search=${query}`, { headers }).pipe(
      catchError(error => {
        console.error('❌ Error al filtrar listas:', error);
        return throwError(() => error);
      })
    );
  }
}