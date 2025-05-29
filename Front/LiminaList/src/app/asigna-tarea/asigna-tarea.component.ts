import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListasService } from '../services/listas.service';

import { HttpClient } from '@angular/common/http';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { CommonModule } from '@angular/common';
import { NgxMaterialTimepickerComponent, NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { Inject } from '@angular/core';
@Component({
  selector: 'app-asigna-tarea',
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule, FormsModule,NgxMaterialTimepickerModule], // 👈 Importar módulos necesarios
  templateUrl: './asigna-tarea.component.html',
  styleUrl: './asigna-tarea.component.css'
})

export class AsignaTareaComponent {

  @Output() fechaSeleccionada = new EventEmitter<string>();
  @Output() horaSeleccionada = new EventEmitter<string>();
  @Output() cerrarVentana = new EventEmitter<void>();

  horaAsignada: string = '23:23'; // 🔹 Nueva variable para almacenar la hora

  cerrarCalendario() {
    this.cerrarVentana.emit();
  }

  constructor(
    @Inject('ASIGNACION_ID') public id: number,
  @Inject('ASIGNACION_NOMBRE') public nombre: string,
  private route: ActivatedRoute, private listasService: ListasService, private http: HttpClient, private router: Router) {
    
  }
  
  //Sistema de mini-calendario
  
  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number = new Date().getMonth(); // Asegurar tipo number
  fechas: (Date | null)[] = [];
  fechaAsignada: string = '';

  diaSeleccionado: string | null = null; // Guarda el día que el usuario está viendo
  diasAsignados: Map<string, string> = new Map(); // Guarda fechas asignadas con sus respectivas horas


  esHoy(fecha: Date): boolean {
      const hoy = new Date();
      return fecha.getUTCFullYear() === hoy.getUTCFullYear() &&
            fecha.getUTCMonth() === hoy.getUTCMonth() &&
            fecha.getUTCDate() === hoy.getUTCDate();
  }

  guardarTarea() {
    // 1️⃣ Convertir y limpiar asignaciones
    const asignacionesLimpias = Array.from(this.diasAsignados.entries())
      .map(([fecha, hora]) => [fecha, (hora === '--:--' || !hora) ? null : hora]);

    console.log(`✅ Guardando tarea con asignaciones (limpias):`, asignacionesLimpias);

    // 2️⃣ Emitir como JSON string
    this.fechaSeleccionada.emit(JSON.stringify(asignacionesLimpias));

    // 3️⃣ Cerrar overlay
    this.cerrarVentana.emit();
  }


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

    seleccionarFecha(fecha: Date) {
      const fechaStr = fecha.toISOString().split('T')[0];

      if (this.diaSeleccionado === fechaStr) {
        // Si el día ya está seleccionado, alternar la asignación
        if (this.diasAsignados.has(fechaStr)) {
          this.diasAsignados.delete(fechaStr); // 🔹 Eliminar si ya estaba asignado
        } else {
          this.diasAsignados.set(fechaStr, '--:--'); // 🔹 Asignar con hora predeterminada
        }
      } else {
        // Si no está seleccionado, simplemente seleccionarlo para ver detalles
        this.diaSeleccionado = fechaStr;
      }

      console.log(`📅 Día seleccionado: ${this.diaSeleccionado}, asignaciones actuales:`, this.diasAsignados);
    }

  ngOnInit(): void {
    this.generarCalendario();
    this.horaAsignada = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 🔹 Cargar asignaciones previas de la tarea
    this.listasService.getAsignacionesTarea(this.id).subscribe({
      next: response => {
        console.log('📌 Asignaciones previas:', response);
        this.diasAsignados = new Map(response.map(({ fecha, hora }) => [fecha, hora ?? '--:--'])); // ✅ Corregido para evitar error de `null`
      },
      error: err => console.error('❌ Error al cargar asignaciones:', err)
    });
  }


@ViewChild('picker') picker!: NgxMaterialTimepickerComponent;

    myTheme = {
      container: { 
        bodyBackgroundColor: "#ffca81",
        buttonColor: "#fff",
      },
      dial: { dialBackgroundColor: "#FF9E16" },
      clockFace: { clockFaceInnerTimeInactiveColor:"white",clockFaceBackgroundColor: "#ffca81", clockHandColor: "#FF9E16", clockFaceTimeInactiveColor: "white" }
    };

  @Input() estados: { nombre: string; color: string }[] = [
    { nombre: 'Sin hacer', color: '#f87171' },
    { nombre: 'En progreso', color: '#facc15' },
    { nombre: 'Casi lista', color: '#fb923c' },
    { nombre: 'Hecha', color: '#4ade80' },
  ];



  
  selectedIndex: number = -1;

  onTimeChange(newTime: string) {
    if (this.diaSeleccionado) {
      this.diasAsignados.set(this.diaSeleccionado, newTime);
      this.horaSeleccionada.emit(newTime); // ✅ Esto es necesario
    }
  }
}
