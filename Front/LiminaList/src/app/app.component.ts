import { Component, OnDestroy, OnInit } from '@angular/core';

import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { MidnightRefreshService } from './services/midnight-refresh.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private themeService: ThemeService,
    private auth: AuthService,
    private midnightRefresh: MidnightRefreshService
  ) {}

  ngOnInit(): void {
    this.midnightRefresh.iniciarRefresco();

    const ajustesRaw = localStorage.getItem('ajustes');
    if (ajustesRaw) {
      try {
        const ajustes = JSON.parse(ajustesRaw);
        this.themeService.iniciarAutoDarkMode(ajustes);
      } catch {
        console.warn('⚠️ Ajustes inválidos');
      }
    }

    if (this.auth.estaAutenticado()) {
      this.auth.getAjustes(this.auth.getToken());
    }
  }

  ngOnDestroy(): void {
    this.themeService.detenerAutoDarkMode();
  }
}