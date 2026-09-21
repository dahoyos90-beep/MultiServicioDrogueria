import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Api, mensajeError } from '../api';
import { Medicamento, Venta } from '../models';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <section class="toolbar">
      <h1>Ventas</h1>
      <button class="primario" (click)="abrirFormulario()">+ Nueva venta</button>
    </section>

    <section class="toolbar">
      <label>Desde
        <input type="date" [(ngModel)]="fechaInicio" />
      </label>
      <label>Hasta
        <input type="date" [(ngModel)]="fechaFin" />
      </label>
      <button (click)="buscar()">Filtrar</button>
      <button (click)="limpiar()">Limpiar</button>
    </section>

    @if (cargando()) { <p class="vacio">Cargando...</p> }
    @if (error())    { <div class="msg error">{{ error() }}</div> }
    @if (exito())    { <div class="msg ok">{{ exito() }}</div> }

    @if (!cargando() && ventas().length > 0) {
      <div class="card">
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
              @for (v of ventas(); track v.id) {
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
      </div>
    }

    @if (!cargando() && ventas().length === 0 && !error()) {
      <div class="card"><p class="vacio">No hay ventas para mostrar.</p></div>
    }

    @if (mostrarFormulario()) {
      <div class="card">
        <h2>Nueva venta</h2>

        <form (ngSubmit)="guardar()" class="form-grid">
          <label>Medicamento
            <select [(ngModel)]="medicamentoId" name="medicamentoId" required>
              <option [ngValue]="null" disabled>Selecciona un medicamento...</option>
              @for (m of medicamentos(); track m.id) {
                <option [ngValue]="m.id">
                  {{ m.nombre }} — {{ m.laboratorio_fabrica }} (stock: {{ m.cantidad_stock }})
                </option>
              }
            </select>
          </label>

          <label>Cantidad
            <input type="number" [(ngModel)]="cantidad" name="cantidad" min="1" step="1" required />
          </label>

          @if (medicamentoSeleccionado()) {
            <div class="card">
              <div class="kpis">
                <div class="kpi">
                  <span>Valor unitario</span>
                  <b>{{ +medicamentoSeleccionado()!.valor_unitario | number:'1.0-0' }}</b>
                </div>
                <div class="kpi">
                  <span>Stock disponible</span>
                  <b>{{ medicamentoSeleccionado()!.cantidad_stock }}</b>
                </div>
                <div class="kpi">
                  <span>Total estimado</span>
                  <b>{{ totalEstimado() | number:'1.0-0' }}</b>
                </div>
              </div>
            </div>
          }

          @if (errorForm()) { <div class="msg error">{{ errorForm() }}</div> }

          <div class="acciones">
            <button type="button" (click)="cerrarFormulario()">Cancelar</button>
            <button type="submit" class="primario" [disabled]="guardando()">
              {{ guardando() ? 'Registrando...' : 'Registrar venta' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: ``,
})
export class Ventas implements OnInit {
  private api = inject(Api);

  ventas = signal<Venta[]>([]);
  medicamentos = signal<Medicamento[]>([]);

  fechaInicio = '';
  fechaFin = '';

  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  exito = signal('');
  errorForm = signal('');

  mostrarFormulario = signal(false);
  medicamentoId: number | null = null;
  cantidad = 1;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');
    this.api.getVentas(this.fechaInicio, this.fechaFin).subscribe({
      next: (resp) => {
        this.ventas.set(resp ?? []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.ventas.set([]);
        this.cargando.set(false);
      },
    });
  }

  buscar(): void {
    this.cargar();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargar();
  }

  medicamentoSeleccionado(): Medicamento | null {
    const id = this.medicamentoId;
    if (id == null) return null;
    return this.medicamentos().find(m => m.id === id) ?? null;
  }

  totalEstimado(): number {
    const m = this.medicamentoSeleccionado();
    if (!m) return 0;
    return Number(m.valor_unitario) * Number(this.cantidad);
  }

  abrirFormulario(): void {
    this.medicamentoId = null;
    this.cantidad = 1;
    this.errorForm.set('');
    this.mostrarFormulario.set(true);

    this.api.getMedicamentos(1, 100).subscribe({
      next: (resp) => { this.medicamentos.set(resp.data ?? []); },
      error: (err) => { this.errorForm.set(mensajeError(err)); },
    });
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.errorForm.set('');
  }

  guardar(): void {
    if (this.medicamentoId == null) {
      this.errorForm.set('Debes seleccionar un medicamento.');
      return;
    }
    if (!Number.isInteger(Number(this.cantidad)) || Number(this.cantidad) <= 0) {
      this.errorForm.set('La cantidad debe ser un entero mayor a 0.');
      return;
    }

    const m = this.medicamentoSeleccionado();
    if (m && Number(this.cantidad) > m.cantidad_stock) {
      this.errorForm.set(`Stock insuficiente. Disponible: ${m.cantidad_stock}.`);
      return;
    }

    this.guardando.set(true);
    this.errorForm.set('');

    this.api.crearVenta(this.medicamentoId, Number(this.cantidad)).subscribe({
      next: (resp) => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.exito.set(`Venta registrada (ID ${resp.ventaId}).`);
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(err));
      },
    });
  }
}