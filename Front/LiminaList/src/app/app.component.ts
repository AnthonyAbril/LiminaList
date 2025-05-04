import { Component } from '@angular/core';

import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LoadingService } from './services/loading.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LiminaList';

  constructor(private router: Router, private loadingService: LoadingService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => this.loadingService.hide(), 500); // 🔹 Pequeño retraso para suavizar la transición
      }
    });
  }

}
