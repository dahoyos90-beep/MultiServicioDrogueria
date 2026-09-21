import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Api, mensajeError } from '../api';
import { Medicamento } from '../models';

@Component({
  selector: 'app-medicamentos',
  imports: [FormsModule, DecimalPipe],
  template: `
    <section class="toolbar">
      <h1>Medicamentos</h1>
      <button class="primario" (click)="abrirFormulario()">+ Nuevo medicamento</button>
    </section>

    <section class="toolbar">
      <label>Nombre
        <input type="text" [(ngModel)]="filtroNombre" (keyup.enter)="buscar()" />
      </label>
      <label>Laboratorio
        <input type="text" [(ngModel)]="filtroLaboratorio" (keyup.enter)="buscar()" />
      </label>
      <button (click)="buscar()">Buscar</button>
      <button (click)="limpiar()">Limpiar</button>
    </section>

    @if (cargando()) { <p class="vacio">Cargando...</p> }
    @if (error())    { <div class="msg error">{{ error() }}</div> }
    @if (exito())    { <div class="msg ok">{{ exito() }}</div> }

    @if (!cargando() && medicamentos().length > 0) {
      <div class="card">
        <div class="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Laboratorio</th>
                <th class="num">Valor unitario</th>
                <th class="num">Stock</th>
                <th>Vence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (m of medicamentos(); track m.id) {
                <tr>
                  <td>{{ m.id }}</td>
                  <td>{{ m.nombre }}</td>
                  <td>{{ m.laboratorio_fabrica }}</td>
                  <td class="num">{{ +m.valor_unitario | number:'1.0-0' }}</td>
                  <td class="num">
                    <span class="badge" [class.alerta]="m.cantidad_stock <= 10"
                                         [class.ok]="m.cantidad_stock > 10">
                      {{ m.cantidad_stock }}
                    </span>
                  </td>
                  <td>{{ m.fecha_vencimiento }}</td>
                  <td class="acciones">
                    <button (click)="editar(m)">Editar</button>
                    <button class="peligro" (click)="eliminar(m)">Borrar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="paginacion">
          <button [disabled]="page() === 1" (click)="cambiarPagina(-1)">‹ Anterior</button>
          <span>Página {{ page() }} de {{ totalPaginas() }}</span>
          <button [disabled]="page() >= totalPaginas()" (click)="cambiarPagina(1)">Siguiente ›</button>
        </div>
      </div>
    }

    @if (!cargando() && medicamentos().length === 0 && !error()) {
      <div class="card"><p class="vacio">No hay medicamentos para mostrar.</p></div>
    }

    @if (mostrarFormulario()) {
      <div class="card">
        <h2>{{ editando() ? 'Editar medicamento' : 'Nuevo medicamento' }}</h2>

        <form (ngSubmit)="guardar()" class="form-grid">
          <label>Nombre
            <input type="text" [(ngModel)]="form.nombre" name="nombre" required />
          </label>
          <label>Laboratorio
            <input type="text" [(ngModel)]="form.laboratorio_fabrica" name="laboratorio_fabrica" required />
          </label>
          <label>Valor unitario
            <input type="number" [(ngModel)]="form.valor_unitario" name="valor_unitario" min="0" step="0.01" required />
          </label>
          <label>Stock
            <input type="number" [(ngModel)]="form.cantidad_stock" name="cantidad_stock" min="0" required />
          </label>
          <label>Fabricación
            <input type="date" [(ngModel)]="form.fecha_fabricacion" name="fecha_fabricacion" required />
          </label>
          <label>Vencimiento
            <input type="date" [(ngModel)]="form.fecha_vencimiento" name="fecha_vencimiento" required />
          </label>

          @if (errorForm()) { <div class="msg error">{{ errorForm() }}</div> }

          <div class="acciones">
            <button type="button" (click)="cerrarFormulario()">Cancelar</button>
            <button type="submit" class="primario" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: ``,
})
export class Medicamentos implements OnInit {
  private api = inject(Api);

  medicamentos = signal<Medicamento[]>([]);
  page = signal(1);
  limit = 10;
  totalPaginas = signal(1);

  filtroNombre = '';
  filtroLaboratorio = '';

  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  exito = signal('');
  errorForm = signal('');

  mostrarFormulario = signal(false);
  editando = signal(false);
  idEditando: number | null = null;

  form: Medicamento = this.formVacio();

  ngOnInit(): void {
    this.cargar();
  }

  formVacio(): Medicamento {
    return {
      nombre: '',
      laboratorio_fabrica: '',
      fecha_fabricacion: '',
      fecha_vencimiento: '',
      cantidad_stock: 0,
      valor_unitario: 0,
    };
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');
    this.api.getMedicamentos(this.page(), this.limit, this.filtroNombre, this.filtroLaboratorio).subscribe({
      next: (resp) => {
        this.medicamentos.set(resp.data ?? []);
        this.totalPaginas.set(resp.totalPages ?? 1);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.medicamentos.set([]);
        this.cargando.set(false);
      },
    });
  }

  buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  limpiar(): void {
    this.filtroNombre = '';
    this.filtroLaboratorio = '';
    this.buscar();
  }

  cambiarPagina(delta: number): void {
    const nueva = this.page() + delta;
    if (nueva < 1 || nueva > this.totalPaginas()) return;
    this.page.set(nueva);
    this.cargar();
  }

  abrirFormulario(): void {
    this.form = this.formVacio();
    this.editando.set(false);
    this.idEditando = null;
    this.errorForm.set('');
    this.mostrarFormulario.set(true);
  }

  editar(m: Medicamento): void {
    this.form = { ...m };
    this.editando.set(true);
    this.idEditando = m.id ?? null;
    this.errorForm.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.errorForm.set('');
  }

  guardar(): void {
    if (!this.form.nombre.trim() || !this.form.laboratorio_fabrica.trim()) {
      this.errorForm.set('Nombre y laboratorio son obligatorios.');
      return;
    }
    const valor = Number(this.form.valor_unitario);
    if (!Number.isFinite(valor) || valor < 0) {
      this.errorForm.set('El valor unitario debe ser un número mayor o igual a 0.');
      return;
    }
    if (!Number.isInteger(Number(this.form.cantidad_stock)) || Number(this.form.cantidad_stock) < 0) {
      this.errorForm.set('El stock debe ser un entero mayor o igual a 0.');
      return;
    }
    if (!this.form.fecha_fabricacion || !this.form.fecha_vencimiento) {
      this.errorForm.set('Las fechas de fabricación y vencimiento son obligatorias.');
      return;
    }
    if (this.form.fecha_vencimiento <= this.form.fecha_fabricacion) {
      this.errorForm.set('La fecha de vencimiento debe ser posterior a la de fabricación.');
      return;
    }

    const payload: Medicamento = {
      ...this.form,
      valor_unitario: valor,
      cantidad_stock: Number(this.form.cantidad_stock),
    };

    this.guardando.set(true);
    this.errorForm.set('');

    const peticion = this.editando() && this.idEditando != null
      ? this.api.actualizarMedicamento(this.idEditando, payload)
      : this.api.crearMedicamento(payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.exito.set(this.editando() ? 'Medicamento actualizado.' : 'Medicamento creado.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorForm.set(mensajeError(err));
      },
    });
  }

  eliminar(m: Medicamento): void {
    if (!m.id) return;
    if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;
    this.api.eliminarMedicamento(m.id).subscribe({
      next: () => { this.exito.set('Medicamento eliminado.'); this.cargar(); },
      error: (err) => { this.error.set(mensajeError(err)); },
    });
  }
}