import { Component, OnInit } from '@angular/core';
import { ListasService } from '../services/listas.service';
import { Lista } from '../listas/lista';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lista-visor',
  standalone: false,
  templateUrl: './lista-visor.component.html',
  styleUrl: './lista-visor.component.css'
})

export class ListaVisorComponent implements OnInit {
  listas: any[] = [];
  filtro: string = '';

  editando = false;

  constructor(private listasService: ListasService, private authService: AuthService, private router: Router) {
    //pruebas
    console.log("PRUEBAS");

    this.listasService.getListasCompartidas().subscribe(res => {
      console.log(res);
    });

    if(false)
    this.listasService.editarPermisoColaborador(
      '45686391',       // ejemplo: '00457231'
      'jony@jony',               // correo del colaborador
      'editar'                   // nuevo permiso ('ver', 'editar', 'progreso', 'asignar')
    ).subscribe({
      next: res => console.log('✔️ Permiso editado', res),
      error: err => console.error('❌ Error editando permiso', err)
    });

    if(true)
    this.listasService.getTareasListaCompartida('45686391').subscribe({
      next: tareas => {
        console.log('✅ Tareas recibidas:', tareas);
      },
      error: err => {
        console.error('❌ Error cargando tareas de lista compartida', err);
      }
    });

    if(true)
    this.listasService.eliminarPermisoColaborador('45686391', 2).subscribe({
      next: resp => console.log('✔️ Colaborador eliminado', resp),
      error: err => console.error('❌ Error eliminando colaborador', err)
    });
  }

  modo: string | null = null;

  leftCollapsed = false;
  rightCollapsed = false;
  listaSeleccionada:Lista|null = null;
  borrar = false; //modo para eliminar o abrir tareas

  toggleLeft() {
    this.leftCollapsed = !this.leftCollapsed;
  }

  toggleRight() {
    this.rightCollapsed = !this.rightCollapsed;
  }

  ngOnInit() {
    this.cargarListas();
  }

  mostrarModal = false;
  listaSeleccionadaId = '';

  abrirModal(id: string) {
    this.listaSeleccionadaId = id;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  

  abrirLista(listaId: any) {
    this.router.navigate(['/panel', listaId]);
  }

  abrirVistaLista(lista: Lista) {
    this.listaSeleccionada = lista;
    this.modo = 'ver';
  }

  activarEdicion() {
    this.modo = 'editar';
    this.editando = true;
  }

  guardarCambiosLista() {
    if (this.modo === 'editar' && this.listaSeleccionada) {
      this.actualizarLista(this.listaSeleccionada);
    }
    this.editando = false;
    this.modo = 'ver';
  }

  abrirCrearLista() {
    this.listaSeleccionada = null;
    this.modo = 'crear';
  }

  activarBorrado() {
    this.modo = this.modo === 'borrar' ? null : 'borrar';
    this.listaSeleccionada = null;
  }



  cargarListas() {
    this.listasService.getListas().subscribe(data => {
      this.listas = data;
    });
  }

  filtrarListas() {
    if (this.filtro.trim() !== '') {
      this.listasService.filtrarListas(this.filtro).subscribe(data => {
        this.listas = data;
      });
    } else {
      this.cargarListas(); // 🔹 Recargar listas completas si no hay filtro
    }
  }

  actualizarLista(lista: any) {
    this.listasService.actualizarLista(lista.id, lista).subscribe({
      next: () => console.log('✅ Lista actualizada:', lista),
      error: (error) => console.error('❌ Error al actualizar lista:', error)
    });
  }

  creandoLista:boolean = false;

  listaStandar = {
    nombre: "Nueva lista",
    descripcion: "Esta es mi nueva lista"
  }

  mostrarBorrarModal = false;
  listaABorrarId: string = '';

  abrirBorrarModal(lista: Lista) {
    this.listaABorrarId = lista.id;
    this.mostrarBorrarModal = true;
  }

  cerrarBorrarModal() {
    this.mostrarBorrarModal = false;
    this.listaABorrarId = '';
  }

  cerrarSidebarSiEsMovil(event: MouseEvent) {
    if (window.innerWidth <= 580) {
      this.modo = null;
      this.listaSeleccionada = null;
    }
  }

  crearListaIndividual() {
    // Genera un número aleatorio de hasta 8 dígitos…
    const rawId = Math.floor(Math.random() * 99999999).toString();
    // …y asegúrate de que siempre tenga 8 caracteres:
    const listaId = rawId.padStart(8, '0');  // p.ej. "00457231"

    const userId = Number(this.authService.getUserId());

    const listaData: Lista = { 
      id: listaId, 
      name: this.listaStandar.nombre, 
      user_id: userId, 
      tipo: 'individual', // 🔹 Agregar tipo 'individual'
      tareas: [] ,
      descripcion: this.listaStandar.descripcion
    };

    this.listasService.crearLista(listaData).subscribe({
      next: response => console.log('✅ Lista creada:', response),
      error: error => console.error('❌ Error al crear la lista:', error)
    });

    this.creandoLista=false;

    this.cargarListas();

    this.modo = null;
    this.listaStandar.nombre = 'Nueva lista';
    this.listaStandar.descripcion = 'Esta es mi nueva lista';
  }


}