import { Component } from '@angular/core';

@Component({
  selector: 'app-lista',
  standalone: false,
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.css'
})
export class ListaComponent {
  estados = ['Opción 1', 'Opción 2', 'Opción 3'];
  estadoActual = 0;
  
  tareas = [
    {
      nombre: 'Tarea 1',
      progreso: '2/2',
      subtareas: [
        {
          nombre: 'Subtarea 1',
          progreso: '2/2',
          subtareas: []
        },
        {
          nombre: 'Subtarea 2',
          progreso: '2/2',
          subtareas: []
        },
        {
          nombre: 'Subtarea 3',
          progreso: '2/2',
          subtareas: [
            {
              nombre: 'Subtarea 3',
              progreso: '2/2',
              subtareas: [
                {
                  nombre: 'Subtarea 3',
                  progreso: '2/2',
                  subtareas: [
                    {
                      nombre: 'Subtarea 3',
                      progreso: '2/2',
                      subtareas: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      nombre: 'Tarea 2',
      progreso: '2/2',
      subtareas: []
    },
    {
      nombre: 'Tarea 3',
      progreso: '2/2',
      subtareas: []
    }
  ];

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
