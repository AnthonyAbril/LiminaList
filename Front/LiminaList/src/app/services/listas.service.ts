import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';
import { TareaFecha } from '../principal/TareaFecha';
import { ProgresoDia }       from '../historico/progreso-dia.model';

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


  getAsignacionesTarea(tareaId: number): Observable<{ fecha: string; hora: string | null }[]> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<{ fecha: string; hora: string | null }[]>(`http://localhost:8000/api/tarea-asignaciones/${tareaId}`, { headers }).pipe(
      tap(response => console.log('📌 Asignaciones cargadas:', response)),
      catchError(error => {
        console.error('❌ Error al obtener asignaciones:', error);
        return throwError(() => error);
      }),
    );
  }

  getTareasPorFecha(fechaCompacta: string): Observable<TareaFecha[]> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // 🔹 Transformar `YYYYMMDD` a `YYYY-MM-DD`
    const fechaFormatoAPI = `${fechaCompacta.substring(0, 4)}-${fechaCompacta.substring(4, 6)}-${fechaCompacta.substring(6, 8)}`;

    return this.http.get<TareaFecha[]>(`http://localhost:8000/api/eventos-por-fecha?fecha=${fechaFormatoAPI}`, { headers }).pipe(
      tap(response => console.log('📌 Respuesta del backend:', response)),
      catchError(error => {
        console.error('❌ Error al obtener tareas de la fecha:', error);
        return throwError(() => error);
      }),
    );
  }

  getTareasProximas(diasFuturos: number): Observable<TareaFecha[]> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const ahora = new Date();
    const desde = ahora.toISOString();
    const hasta = new Date(ahora.getTime() + diasFuturos * 24 * 60 * 60 * 1000).toISOString();

    return this.http.get<TareaFecha[]>(`http://localhost:8000/api/eventos-proximos?desde=${desde}&hasta=${hasta}`, { headers }).pipe(
      tap(response => console.log('📌 Respuesta del backend:', response)), // Ver estructura de datos
      catchError(error => {
        console.error('❌ Error al obtener tareas próximas:', error);
        return throwError(() => error);
      }),
    );
  }

  asignarTareaFechas(tareasFechas: any[]): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`http://localhost:8000/api/asignar-tarea-fechas`, { tareasFechas }, { headers }).pipe(
      tap(response => console.log('📌 Respuesta del backend:', response)),
      catchError(error => {
        console.error('❌ Error al asignar tareas:', error);
        return throwError(() => error);
      }),
    );
  }

  crearLista(lista: Lista): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return this.http.post(this.apiUrl, lista, { headers });
  }

  borrarLista(listaId: string): Observable<any> {
    const token = localStorage.getItem('token');  

    if (!token) {
      console.error('❌ No hay token de autenticación.');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${listaId}`, { headers }).pipe(
      catchError(error => {
        console.error('❌ Error al borrar lista:', error);
        return throwError(() => error);
      })
    );
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

  editarAsignacionesTarea(tareaId: number, asignaciones: { fecha: string; hora: string | null }[]): Observable<any> {
    const token = localStorage.getItem('token')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `http://localhost:8000/api/editar-asignaciones-tarea`,
      { tarea_id: tareaId, asignaciones },
      { headers }
    );
  }

  
  private authHeaders() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) };
  }
  
  /** Histórico raíz (tareas sin padre) */
  getHistorialProgreso(): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>('http://localhost:8000/api/historial-progreso', this.authHeaders());
  }
  getHistorialSubtareas(rootId: number): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>(
      `http://localhost:8000/api/historial-progreso/${rootId}`,
      this.authHeaders()
    );
  }


  getHistorialProgresoPorTarea(tareaId: number): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>(
      `http://localhost:8000/api/historial-progreso/${tareaId}`, this.authHeaders()
    );
  }

    /** Nivel raíz */
  getHistorialRaiz(): Observable<ProgresoDia[]> {
    return this.http.get<ProgresoDia[]>(`http://localhost:8000/api/historial-progreso/`, this.authHeaders());
  }
}