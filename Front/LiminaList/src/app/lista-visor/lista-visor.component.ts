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

  constructor(private listasService: ListasService, private authService: AuthService, private router: Router) {}

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


  cargarListas() {
    this.listasService.getListas().subscribe(data => {
      this.listas = data;
    });
  }

  abrirLista(listaId:any){
    this.router.navigate(['/panel', listaId]);
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

  crearListaIndividual(nombre: string) {
    const listaId = Math.floor(Math.random() * 99999999).toString(); // 🔹 ID aleatorio para evitar conflicto con listas diarias
    const userId = Number(this.authService.getUserId());

    const listaData: Lista = { 
      id: listaId, 
      name: nombre, 
      user_id: userId, 
      tipo: 'individual', // 🔹 Agregar tipo 'individual'
      tareas: [] 
    };

    this.listasService.crearLista(listaData).subscribe({
      next: response => console.log('✅ Lista creada:', response),
      error: error => console.error('❌ Error al crear la lista:', error)
    });


  }

}