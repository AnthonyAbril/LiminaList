import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}