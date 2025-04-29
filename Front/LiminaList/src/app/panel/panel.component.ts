import { Component } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: false,
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent {
  editar = false; // 🔹 Estado global del modo edición

  toggleEdicion(): void {
    this.editar = !this.editar;
    console.log(this.editar);
  }

}
