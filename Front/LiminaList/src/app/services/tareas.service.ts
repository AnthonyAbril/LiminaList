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

  editarProgreso(
    tareaId: number,
    progreso: number,
    fecha: string | null = null            // primero el dato “fijo”, luego la fecha opcional
  ): Observable<any> {

    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    /* armamos el body sin ‘fecha’ cuando no hace falta */
    const body: any = { tarea_id: tareaId, progreso };
    if (fecha !== null) { body.fecha = fecha; }
    console.log('EDITAR PROGRESO payload', body);

    return this.http.post('http://localhost:8000/api/editar-progreso', body, { headers }).pipe(
      tap(r => console.log('📌 Progreso actualizado', r)),
      catchError(err => { console.error('❌', err); return throwError(() => err); })
    );
  }

  // tareas.service.ts
  getHistorialProgreso(tareaId: number): Observable<{ fecha: string; progreso: number }[]> {
    return this.http.get<{ fecha: string; progreso: number }[]>(
      `${this.apiUrl}/${tareaId}/historial-progreso`
    );
  }

  editarAsignacion(data: {
    tarea_id: number;
    asignaciones: { fecha: string; hora: string | null }[];
  }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post('http://localhost:8000/api/editar-asignaciones-tarea', data, { headers }).pipe(
      tap(r => console.log('⏰ Asignación actualizada', r)),
      catchError(err => {
        console.error('❌ Error al actualizar asignación:', err);
        return throwError(() => err);
      })
    );
  }
  
}