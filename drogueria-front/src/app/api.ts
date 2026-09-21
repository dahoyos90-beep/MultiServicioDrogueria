import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Medicamento, PaginaMedicamentos, Venta, VentaCreada,
  ReporteStockBajo, ReporteVencidos, ReporteVentas,
} from './models';

const BASE = '/api/v1';

/** Convierte un error HTTP del backend en un texto legible. */
export function mensajeError(err: any): string {
  if (err?.status === 0 || err?.status === 504) {
    return 'No hay conexión con el backend. Verifica que el gateway (:8080) y los servicios estén encendidos.';
  }
  const b = err?.error;
  if (b?.message) return b.error ? `${b.message}: ${b.error}` : b.message;
  return err?.message ?? 'Error inesperado';
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  // ---------- Medicamentos ----------
  getMedicamentos(page = 1, limit = 10, nombre = '', laboratorio = '') {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (nombre) params = params.set('nombre', nombre);
    if (laboratorio) params = params.set('laboratorio', laboratorio);
    return this.http.get<PaginaMedicamentos>(`${BASE}/medicamentos`, { params });
  }

  crearMedicamento(m: Medicamento) {
    return this.http.post<{ id: number; message: string }>(`${BASE}/medicamentos`, m);
  }

  actualizarMedicamento(id: number, m: Medicamento) {
    return this.http.put<{ message: string }>(`${BASE}/medicamentos/${id}`, m);
  }

  eliminarMedicamento(id: number) {
    return this.http.delete<{ message: string }>(`${BASE}/medicamentos/${id}`);
  }

  // ---------- Ventas ----------
  crearVenta(medicamento_id: number, cantidad: number) {
    return this.http.post<VentaCreada>(`${BASE}/ventas`, { medicamento_id, cantidad });
  }

  getVentas(fechaInicio = '', fechaFin = '') {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<Venta[]>(`${BASE}/ventas`, { params });
  }

  // ---------- Reportes ----------
  getStockBajo(limite = 10) {
    return this.http.get<ReporteStockBajo>(`${BASE}/reportes/stock-bajo`, {
      params: new HttpParams().set('limite', limite),
    });
  }

  getVencidos(dias = 30) {
    return this.http.get<ReporteVencidos>(`${BASE}/reportes/vencidos`, {
      params: new HttpParams().set('dias', dias),
    });
  }

  getResumenVentas(fechaInicio = '', fechaFin = '') {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ReporteVentas>(`${BASE}/reportes/ventas`, { params });
  }
}