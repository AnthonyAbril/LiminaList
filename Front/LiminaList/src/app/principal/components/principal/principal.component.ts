import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListasService } from '../../../services/listas.service';
import { Tarea } from '../../../tareas/components/tarea/tarea';

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

  constructor(private listasService: ListasService, private router: Router) {}

  ngOnInit(): void {
    // Carga inicial de datos
    this.listasService.getListas().subscribe(response => this.listas = response);
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
    // Usar métodos UTC
    const listaId = `${fecha.getUTCDate()}-${fecha.getUTCMonth() + 1}-${fecha.getUTCFullYear()}`;
    this.router.navigate(['/panel', listaId]);
  }

  cambiarVista(vista: string): void {
    this.resumen = vista;
  }

  seleccionarLista(listaId: number): void {
    this.router.navigate(['/panel', listaId]);
  }
}
