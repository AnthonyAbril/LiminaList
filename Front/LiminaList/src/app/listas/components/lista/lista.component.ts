import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lista',
  standalone: false,
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.css'
})
export class ListaComponent {
  @Input() editar = false; // 🔹 Recibe la variable desde PanelComponent

  estados = ['Opción 1', 'Opción 2', 'Opción 3'];
  estadoActual = 0;
  
  tareas = [
    {
      nombre: 'Estudiar PAU',
      progreso: '',
      subtareas: [
        {
          nombre: 'Estudiar Matematicas',
          progreso: '',
          subtareas: [
            {
              nombre: 'Estudiar Matrices',
              progreso: '',
              subtareas: [
                {
                  nombre: 'Estudiar Ecuaciones Matriciales',
                  progreso: '',
                  subtareas: []
                },
                {
                  nombre: 'Estudiar Rango de Matrices',
                  progreso: '',
                  subtareas: []
                }
              ]
            },
            {
              nombre: 'Estudiar Geometria Analítica',
              progreso: '',
              subtareas: []
            }
          ]
        },
        {
          nombre: 'Estudiar Fisica',
          progreso: '',
          subtareas: [
            {
              nombre: 'Estudiar Campo Gravitatorio',
              progreso: '',
              subtareas: []
            }
          ]
        }
      ]
    },
    {
      nombre: 'TFG Proyecto Liminalist',
      progreso: '',
      subtareas: [
        {
          nombre: '1ra Entrega',
          progreso: '',
          subtareas: [
            {
              nombre: 'Idea de funcionalidad y logica',
              progreso: '',
              subtareas: []
            },
            {
              nombre: 'Diseño de interfaz',
              progreso: '',
              subtareas: []
            },
            {
              nombre: 'Programacion Base',
              progreso: '',
              subtareas: [
                {
                  nombre: 'Front boceto hecho',
                  progreso: '',
                  subtareas: [
                    {
                      nombre: 'Front boceto ordenador',
                      progreso: '',
                      subtareas: []
                    },
                    {
                      nombre: 'Front boceto movil',
                      progreso: '',
                      subtareas: []
                    }
                  ]
                },
                {
                  nombre: 'Logica Programada',
                  progreso: '',
                  subtareas: [
                    {
                      nombre: 'CRUD de tareas',
                      progreso: '',
                      subtareas: [
                        {
                          nombre: 'Crear tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          nombre: 'Eliminar tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          nombre: 'Modificar tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          nombre: 'Mover tareas',
                          progreso: '',
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
          nombre: '2ra Entrega',
          progreso: '',
          subtareas: []
        },
        {
          nombre: '3ra Entrega',
          progreso: '',
          subtareas: []
        }
      ]
    },
    {
      nombre: 'Practicas Empresa',
      progreso: '',
      subtareas: []
    }
  ];

  // Método para añadir una nueva subtarea
  agregarTarea(): void {
    const nuevaTarea = {
      nombre: `Tarea ${this.tareas.length + 1}`, // Nombre dinámico
      progreso: '',
      subtareas: [], // Las subtareas empiezan vacías
    };
    this.tareas.push(nuevaTarea); // Añade la nueva subtarea al array
  }

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
