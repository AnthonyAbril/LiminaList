import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListasService } from '../services/listas.service';

import { HttpClient } from '@angular/common/http';
import { Lista } from '../listas/lista';
import { Tarea } from '../tareas/components/tarea/tarea';
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { CommonModule } from '@angular/common';
import { NgxMaterialTimepickerComponent, NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@Component({
  selector: 'app-asigna-tarea',
  imports: [CommonModule, FormsModule,NgxMaterialTimepickerModule], // 👈 Importar módulos necesarios
  templateUrl: './asigna-tarea.component.html',
  styleUrl: './asigna-tarea.component.css'
})

export class AsignaTareaComponent {

  @Input() nombre: string = "Nombre";
  @Output() fechaSeleccionada = new EventEmitter<string>();
  @Output() horaSeleccionada = new EventEmitter<string>();
  @Output() cerrarVentana = new EventEmitter<void>();
  horaAsignada: string = '23:23'; // 🔹 Nueva variable para almacenar la hora

  cerrarCalendario() {
    this.cerrarVentana.emit();
  }

  constructor(private route: ActivatedRoute, private listasService: ListasService, private http: HttpClient, private router: Router) {
    
  }
  
  //Sistema de mini-calendario
  
  dias: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  anioSeleccionado: number = new Date().getFullYear();
  mesSeleccionado: number = new Date().getMonth(); // Asegurar tipo number
  fechas: (Date | null)[] = [];
  fechaAsignada: string = '';


  esHoy(fecha: Date): boolean {
      const hoy = new Date();
      return fecha.getUTCFullYear() === hoy.getUTCFullYear() &&
            fecha.getUTCMonth() === hoy.getUTCMonth() &&
            fecha.getUTCDate() === hoy.getUTCDate();
  }

  guardarTarea() {
    console.log(`✅ Guardando tarea con fecha: ${this.fechaAsignada}, hora: ${this.horaAsignada}`);
    this.fechaSeleccionada.emit(this.fechaAsignada);
    this.horaSeleccionada.emit(this.horaAsignada);
    //this.actualizarNombre.emit(this.nombre); // ✅ Emitir el nombre de la tarea

    this.cerrarVentana.emit(); // 🔹 Cierra el modal después de guardar
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
      if (fecha) {
        this.fechaAsignada = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        //this.fechaSeleccionada.emit(this.fechaAsignada); // 🔹 Emitir fecha
      }
    }

  ngOnInit(): void {
    this.generarCalendario();
    this.horaAsignada = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // ✅ Configurar hora actual al iniciar
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
    this.horaAsignada = newTime; // 🔹 Guarda la hora en la variable
    //this.horaSeleccionada.emit(newTime); // 🔹 Emite la hora seleccionada
  }
}
