import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Api, mensajeError } from '../api';
import { ReporteStockBajo, ReporteVencidos, ReporteVentas } from '../models';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <section class="toolbar">
      <h1>Reportes</h1>
    </section>

    <!-- Stock bajo -->
    <div class="card">
      <h2>Stock bajo</h2>
      <div class="toolbar">
        <label>Límite
          <input type="number" [(ngModel)]="limiteStock" min="1" step="1" />
        </label>
        <button class="primario" [disabled]="cargandoStock()" (click)="consultarStockBajo()">
          {{ cargandoStock() ? 'Consultando...' : 'Consultar stock bajo' }}
        </button>
      </div>

      @if (errorStock()) { <div class="msg error">{{ errorStock() }}</div> }

      @if (stockBajo()) {
        <div class="kpis">
          <div class="kpi">
            <span>Criterio (≤)</span>
            <b>{{ stockBajo()!.criterioLimite }}</b>
          </div>
          <div class="kpi">
            <span>Resultados</span>
            <b>{{ stockBajo()!.totalResultados }}</b>
          </div>
        </div>

        @if (stockBajo()!.medicamentos.length > 0) {
          <div class="tabla-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Laboratorio</th>
                  <th class="num">Stock</th>
                  <th>Vence</th>
                </tr>
              </thead>
              <tbody>
                @for (m of stockBajo()!.medicamentos; track m.id) {
                  <tr>
                    <td>{{ m.id }}</td>
                    <td>{{ m.nombre }}</td>
                    <td>{{ m.laboratorio_fabrica }}</td>
                    <td class="num">
                      <span class="badge alerta">{{ m.cantidad_stock }}</span>
                    </td>
                    <td>{{ m.fecha_vencimiento | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="vacio">No hay medicamentos con stock bajo.</p>
        }
      }
    </div>

    <!-- Vencidos -->
    <div class="card">
      <h2>Próximos a vencer</h2>
      <div class="toolbar">
        <label>Días de margen
          <input type="number" [(ngModel)]="diasMargen" min="1" step="1" />
        </label>
        <button class="primario" [disabled]="cargandoVencidos()" (click)="consultarVencidos()">
          {{ cargandoVencidos() ? 'Consultando...' : 'Consultar vencimientos' }}
        </button>
      </div>

      @if (errorVencidos()) { <div class="msg error">{{ errorVencidos() }}</div> }

      @if (vencidos()) {
        <div class="kpis">
          <div class="kpi">
            <span>Días de margen</span>
            <b>{{ vencidos()!.diasMargen }}</b>
          </div>
          <div class="kpi">
            <span>Resultados</span>
            <b>{{ vencidos()!.totalResultados }}</b>
          </div>
        </div>

        @if (vencidos()!.medicamentos.length > 0) {
          <div class="tabla-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Laboratorio</th>
                  <th class="num">Stock</th>
                  <th>Vence</th>
                </tr>
              </thead>
              <tbody>
                @for (m of vencidos()!.medicamentos; track m.id) {
                  <tr>
                    <td>{{ m.id }}</td>
                    <td>{{ m.nombre }}</td>
                    <td>{{ m.laboratorio_fabrica }}</td>
                    <td class="num">{{ m.cantidad_stock }}</td>
                    <td>
                      <span class="badge peligro">{{ m.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="vacio">No hay medicamentos próximos a vencer.</p>
        }
      }
    </div>

    <!-- Resumen de ventas -->
    <div class="card">
      <h2>Resumen de ventas</h2>
      <div class="toolbar">
        <label>Desde
          <input type="date" [(ngModel)]="fechaInicioVentas" />
        </label>
        <label>Hasta
          <input type="date" [(ngModel)]="fechaFinVentas" />
        </label>
        <button class="primario" [disabled]="cargandoVentas()" (click)="consultarResumenVentas()">
          {{ cargandoVentas() ? 'Consultando...' : 'Consultar resumen' }}
        </button>
      </div>

      @if (errorVentas()) { <div class="msg error">{{ errorVentas() }}</div> }

      @if (resumenVentas()) {
        <div class="kpis">
          <div class="kpi">
            <span>Transacciones</span>
            <b>{{ resumenVentas()!.totalTransacciones }}</b>
          </div>
          <div class="kpi">
            <span>Unidades vendidas</span>
            <b>{{ resumenVentas()!.totalUnidadesVendidas }}</b>
          </div>
          <div class="kpi">
            <span>Ingresos</span>
            <b>{{ resumenVentas()!.totalIngresos | number:'1.0-0' }}</b>
          </div>
        </div>

        @if (resumenVentas()!.ventasDetalle.length > 0) {
          <div class="tabla-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Medicamento</th>
                  <th class="num">Cantidad</th>
                  <th class="num">Valor unitario</th>
                  <th class="num">Valor total</th>
                  <th>Fecha</th>
                  <th>Hora de venta</th>
                </tr>
              </thead>
              <tbody>
                @for (v of resumenVentas()!.ventasDetalle; track v.id) {
                  <tr>
                    <td>{{ v.id }}</td>
                    <td>{{ v.nombre_medicamento }}</td>
                    <td class="num">{{ v.cantidad }}</td>
                    <td class="num">{{ +v.valor_unitario | number:'1.0-0' }}</td>
                    <td class="num">{{ +v.valor_total | number:'1.0-0' }}</td>
                    <td>{{ v.fecha_hora | date:'dd/MM/yyyy' }}</td>
                    <td>{{ v.fecha_hora | date:'hh:mm a' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="vacio">No hay ventas en el rango seleccionado.</p>
        }
      }
    </div>
  `,
  styles: ``,
})
export class Reportes {
  private api = inject(Api);

  limiteStock = 10;
  diasMargen = 30;
  fechaInicioVentas = '';
  fechaFinVentas = '';

  stockBajo = signal<ReporteStockBajo | null>(null);
  vencidos = signal<ReporteVencidos | null>(null);
  resumenVentas = signal<ReporteVentas | null>(null);

  cargandoStock = signal(false);
  cargandoVencidos = signal(false);
  cargandoVentas = signal(false);

  errorStock = signal('');
  errorVencidos = signal('');
  errorVentas = signal('');

  consultarStockBajo(): void {
    this.cargandoStock.set(true);
    this.errorStock.set('');
    this.api.getStockBajo(Number(this.limiteStock)).subscribe({
      next: (resp) => {
        this.stockBajo.set(resp);
        this.cargandoStock.set(false);
      },
      error: (err) => {
        this.errorStock.set(mensajeError(err));
        this.stockBajo.set(null);
        this.cargandoStock.set(false);
      },
    });
  }

  consultarVencidos(): void {
    this.cargandoVencidos.set(true);
    this.errorVencidos.set('');
    this.api.getVencidos(Number(this.diasMargen)).subscribe({
      next: (resp) => {
        this.vencidos.set(resp);
        this.cargandoVencidos.set(false);
      },
      error: (err) => {
        this.errorVencidos.set(mensajeError(err));
        this.vencidos.set(null);
        this.cargandoVencidos.set(false);
      },
    });
  }

  consultarResumenVentas(): void {
    this.cargandoVentas.set(true);
    this.errorVentas.set('');
    this.api.getResumenVentas(this.fechaInicioVentas, this.fechaFinVentas).subscribe({
      next: (resp) => {
        this.resumenVentas.set(resp);
        this.cargandoVentas.set(false);
      },
      error: (err) => {
        this.errorVentas.set(mensajeError(err));
        this.resumenVentas.set(null);
        this.cargandoVentas.set(false);
      },
    });
  }
}