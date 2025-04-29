import { Component } from '@angular/core';

@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {
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

}
