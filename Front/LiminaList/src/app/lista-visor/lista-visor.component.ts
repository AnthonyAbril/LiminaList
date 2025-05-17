import { Component, OnInit } from '@angular/core';
import { ListasService } from '../services/listas.service';


@Component({
  selector: 'app-lista-visor',
  standalone: false,
  templateUrl: './lista-visor.component.html',
  styleUrl: './lista-visor.component.css'
})

export class ListaVisorComponent implements OnInit {
  listas: any[] = [];
  filtro: string = '';
  sidebarCollapsed = true;

  constructor(private listasService: ListasService) {}

toggleSidebar() {
  this.sidebarCollapsed = !this.sidebarCollapsed;
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