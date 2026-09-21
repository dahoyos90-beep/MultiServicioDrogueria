import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <a class="marca" routerLink="/medicamentos">
        <span class="logo"><img src="logo-escudo.jpg" alt="Logo" /></span>
        <span>Multiservicios <b>Droguería</b></span>
      </a>
      <nav>
        <a routerLink="/medicamentos" routerLinkActive="activo">Medicamentos</a>
        <a routerLink="/ventas" routerLinkActive="activo">Ventas</a>
        <a routerLink="/reportes" routerLinkActive="activo">Reportes</a>
      </nav>
    </header>
    <main class="pagina">
      <router-outlet />
    </main>
  `,
  styles: [`
    .barra {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; flex-wrap: wrap; padding: 8px 24px;
      background: rgba(16, 19, 26, .9);
      border-bottom: 1px solid var(--borde);
      position: sticky; top: 0; z-index: 10;
      backdrop-filter: blur(6px);
    }
    .marca {
      display: flex; align-items: center; gap: 12px;
      text-decoration: none; color: var(--texto);
      font-family: 'Exo 2', system-ui, sans-serif;
      font-style: italic; font-weight: 800;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .marca b {
      background: var(--degradado);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    /* Recorta el escudo del JPG (que trae mucho margen negro) */
    .logo { width: 48px; height: 48px; overflow: hidden; position: relative; flex: none; }
    .logo img {
      position: absolute; width: 110px; left: -31px; top: -6px;
      mix-blend-mode: screen;
    }
    nav { display: flex; gap: 6px; }
    nav a {
      color: var(--suave); text-decoration: none;
      padding: 8px 14px; border-radius: 8px;
    }
    nav a:hover { color: var(--texto); }
    nav a.activo {
      color: var(--azul);
      background: linear-gradient(90deg, var(--azul), var(--verde)) bottom / 100% 2px no-repeat;
    }
  `],
})
export class App {}