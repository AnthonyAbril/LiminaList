import { Component, OnInit } from '@angular/core';
import { ListasService } from '../services/listas.service';
import { Lista } from '../listas/lista';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-lista-visor',
  standalone: false,
  templateUrl: './lista-visor.component.html',
  styleUrl: './lista-visor.component.css'
})

export class ListaVisorComponent implements OnInit {
  listas: any[] = [];
  filtro: string = '';

  constructor(private listasService: ListasService, private authService: AuthService) {}

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
}