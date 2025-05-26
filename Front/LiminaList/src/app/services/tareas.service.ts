import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Tarea } from '../tareas/components/tarea/tarea';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private apiUrl = 'http://localhost:8000/api/tareas'; // 🔹 Ruta del backend Laravel

  constructor(private http: HttpClient) {}

  getTareas(): Observable<Tarea[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get<Tarea[]>(this.apiUrl, { headers });
  }

  getTareaPorId(tareaId: number): Observable<Tarea> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.get<Tarea>(`${this.apiUrl}/${tareaId}`, { headers });
  }

  agregarTarea(tarea: Tarea): Observable<Tarea> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post<Tarea>(this.apiUrl, tarea, { headers });
  }

  editarTarea(tareaId: number, nuevaData: Partial<Tarea>): Observable<Tarea> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.put<Tarea>(`${this.apiUrl}/${tareaId}`, nuevaData, { headers });
  }

  eliminarTarea(tareaId: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.delete<void>(`${this.apiUrl}/${tareaId}`, { headers });
  }

  editarProgreso(tareaId: number, fecha: string, progreso: number): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`http://localhost:8000/api/editar-progreso`, { tarea_id: tareaId, fecha, progreso }, { headers }).pipe(
      tap(response => console.log('📌 Progreso actualizado:', response)),
      catchError(error => {
        console.error('❌ Error al actualizar progreso:', error);
        return throwError(() => error);
      }),
    );
  }
}