import { Component, Input } from '@angular/core';
import { Tarea } from '../../../tareas/components/tarea/tarea';
import { ActivatedRoute } from '@angular/router';
import { TareasService } from '../../../services/tareas.service';

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
  
  @Input() tareas: Tarea[] = [
    /*
    {
      id: 1,
      title: "Leer sobre álgebra lineal",
      description: "Revisar el capítulo de matrices y determinantes.",
      progreso: '',
      list_id: 4,
      padre: null,
      created_at: "2025-04-26T22:25:36.000000Z",
      updated_at: "2025-04-26T22:25:36.000000Z",
      subtareas: [
          {
              id: 2,
              title: "Ejercicios de algebra",
              description: null,
              progreso: '',
              list_id: 4,
              padre: 1,
              subtareas: [],
              created_at: null,
              updated_at: null
          }
      ]
  },
  {
      id: 3,
      title: "Estudiar Fisica",
      description: null,
      progreso: '',
      list_id: 4,
      padre: null,
      created_at: null,
      updated_at: null,
      subtareas: []
  }
      */
  
  /*,
    {
      title: 'Estudiar PAU',
      progreso: '',
      subtareas: [
        {
          title: 'Estudiar Matematicas',
          progreso: '',
          subtareas: [
            {
              title: 'Estudiar Matrices',
              progreso: '',
              subtareas: [
                {
                  title: 'Estudiar Ecuaciones Matriciales',
                  progreso: '',
                  subtareas: []
                },
                {
                  title: 'Estudiar Rango de Matrices',
                  progreso: '',
                  subtareas: []
                }
              ]
            },
            {
              title: 'Estudiar Geometria Analítica',
              progreso: '',
              subtareas: []
            }
          ]
        },
        {
          title: 'Estudiar Fisica',
          progreso: '',
          subtareas: [
            {
              title: 'Estudiar Campo Gravitatorio',
              progreso: '',
              subtareas: []
            }
          ]
        }
      ]
    },
    {
      title: 'TFG Proyecto Liminalist',
      progreso: '',
      subtareas: [
        {
          title: '1ra Entrega',
          progreso: '',
          subtareas: [
            {
              title: 'Idea de funcionalidad y logica',
              progreso: '',
              subtareas: []
            },
            {
              title: 'Diseño de interfaz',
              progreso: '',
              subtareas: []
            },
            {
              title: 'Programacion Base',
              progreso: '',
              subtareas: [
                {
                  title: 'Front boceto hecho',
                  progreso: '',
                  subtareas: [
                    {
                      title: 'Front boceto ordenador',
                      progreso: '',
                      subtareas: []
                    },
                    {
                      title: 'Front boceto movil',
                      progreso: '',
                      subtareas: []
                    }
                  ]
                },
                {
                  title: 'Logica Programada',
                  progreso: '',
                  subtareas: [
                    {
                      title: 'CRUD de tareas',
                      progreso: '',
                      subtareas: [
                        {
                          title: 'Crear tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          title: 'Eliminar tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          title: 'Modificar tareas',
                          progreso: '',
                          subtareas: []
                        },
                        {
                          title: 'Mover tareas',
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
          title: '2ra Entrega',
          progreso: '',
          subtareas: []
        },
        {
          title: '3ra Entrega',
          progreso: '',
          subtareas: []
        }
      ]
    },
    {
      title: 'Practicas Empresa',
      progreso: '',
      subtareas: []
    }
      */
  ];

  listaId;
  
  constructor(private route: ActivatedRoute, private tareasService: TareasService) {
    this.listaId = Number(this.route.snapshot.paramMap.get('id')); // 🔹 Convertir a número al obtenerlo
  }

  // Método para añadir una nueva subtarea
  agregarTarea(): void {
    const nuevaTarea = {
      id: Date.now(),
      title: `Tarea ${this.tareas.length + 1}`, // title dinámico
      description: null,
      progreso: '',
      list_id: this.listaId ? Number(this.listaId) : undefined,
      padre: null,
      created_at: null,
      updated_at: null,
      subtareas: [] 
    };
    console.log(this.tareas)

    //se añade subtarea a backend
    this.tareasService.agregarTarea(nuevaTarea).subscribe({
      next: (response) => {
        console.log('✅ Tarea guardada en el backend:', response);

        // 🔹 Aquí verifica si se está duplicando
        if (!response.title || response.title.trim() === '') {
          console.warn('⚠ Tarea sin título detectada, no se agrega al frontend.');
          return;
        }

      },
      error: (error) => {
        console.error('❌ Error al guardar tarea:', error);
      }
    });

    this.tareas.push(nuevaTarea); // Añade la nueva Tarea al array
  }

  eliminarTarea(tareaEliminada: Tarea): void {
  
    this.tareas.splice(this.tareas.indexOf(tareaEliminada), 1);

    this.tareasService.eliminarTarea(tareaEliminada.id).subscribe({
      next: () => {
        console.log('✅ Tarea eliminada correctamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar tarea:', error);
      }
    });
  }

  toggleState() {
    this.estadoActual = (this.estadoActual + 1) % this.estados.length;
  }
}
