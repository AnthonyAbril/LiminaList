import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListasService } from '../../../services/listas.service';
import { Tarea } from '../../../tareas/components/tarea/tarea';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Lista } from '../../../listas/lista';

@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  anioSeleccionado: number = new Date().getFullYear();
  fechas: (Date | null)[] = [];

  listas: any[] = [];
  tareas: Tarea[] = [];
  resumen: string = 'listas';

  constructor(private authService:AuthService, private listasService: ListasService, private router: Router) {}

  ngOnInit(): void {
    // Carga inicial de datos
    this.listasService.getListas().subscribe({
      next: response => this.listas = response,
      error: err => console.error('Error cargando listas', err)
    });

    this.generarCalendario();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getUTCFullYear() === hoy.getUTCFullYear() &&
           fecha.getUTCMonth() === hoy.getUTCMonth() &&
           fecha.getUTCDate() === hoy.getUTCDate();
}

  // En tu componente
mesSeleccionado: number = new Date().getMonth(); // Asegurar tipo number

generarCalendario(): void {
    const año = Number(this.anioSeleccionado); // Conversión explícita
    const mes = Number(this.mesSeleccionado);   // Conversión explícita

    this.fechas = [];
    
    // 1. Calcular fechas en UTC
    const primerDia = new Date(Date.UTC(año, mes, 1));
    const ultimoDia = new Date(Date.UTC(año, mes + 1, 0));
    
    // 2. Calcular offset
    const offsetInicial = (primerDia.getUTCDay() + 6) % 7;
    
    // 3. Llenar nulls iniciales
    this.fechas = Array(offsetInicial).fill(null);
    
    // 4. Agregar días del mes CORRECTO
    const diasMes = ultimoDia.getUTCDate();
    for (let dia = 1; dia <= diasMes; dia++) {
        this.fechas.push(new Date(Date.UTC(año, mes, dia)));
    }
    
    // 5. Completar con nulls
    const totalCeldas = Math.ceil(this.fechas.length / 7) * 7;
    while (this.fechas.length < totalCeldas) {
        this.fechas.push(null);
    }
}

  cambiarMes(): void {
    this.generarCalendario();
  }

  abrirListaDelDia(fecha: Date | null): void {
    if (!fecha) return;

    const listaId = `${fecha.getUTCFullYear()}${(fecha.getUTCMonth() + 1).toString().padStart(2, '0')}${fecha.getUTCDate().toString().padStart(2, '0')}`;

    this.listasService.getListaPorId(listaId).subscribe({
      next: response => {
        console.log('✅ Lista encontrada:', response);
        this.router.navigate(['/panel', listaId]); // Si existe, navegar a la lista
      },
      error: () => {
        console.warn('⚠ Lista no encontrada, creando nueva automáticamente:', listaId);
        this.crearListaDelDia(listaId, fecha); // 🔹 Crear lista automáticamente
      }
    });
  }

  logout(){
    this.authService.logout();
  }

  crearListaDelDia(listaId: string, fecha: Date): void {
    const nombreLista = `${fecha.getUTCDate()}/${fecha.getUTCMonth() + 1}/${fecha.getUTCFullYear()}`;
    const token = sessionStorage.getItem('token');
    const userId = Number(this.authService.getUserId());

    if (!token || !userId) {
      console.error('❌ No hay sesión activa.');
      return;
    }

    const listaData: Lista = { 
      id: listaId, 
      name: nombreLista, 
      user_id: userId, 
      tipo: 'diaria', // 🔹 Agregar tipo 'diaria'
      tareas: [] 
    };

    console.log('📌 Datos enviados:', listaData); // 🔹 Inspección de datos antes de enviar

    this.listasService.crearLista(listaData).subscribe({
      next: response => {
        console.log('✅ Lista del día creada:', response);
        this.router.navigate(['/panel', listaId]);
      },
      error: error => {
        console.error('❌ Error al crear la lista del día:', error);
        console.log('User ID en frontend:', Number(this.authService.getUserId())); 
      }
    });
  }

  cambiarVista(vista: string): void {
    this.resumen = vista;
  }

  seleccionarLista(listaId: string): void { // Cambiado de number a string
    this.router.navigate(['/panel', listaId]);
  }
}
