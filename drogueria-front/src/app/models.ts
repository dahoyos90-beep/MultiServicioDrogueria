export interface Medicamento {
  id?: number;
  nombre: string;
  laboratorio_fabrica: string;
  fecha_fabricacion: string;
  fecha_vencimiento: string;
  cantidad_stock: number;
  valor_unitario: number | string; // mysql2 devuelve DECIMAL como texto
  created_at?: string;
  updated_at?: string;
}

export interface PaginaMedicamentos {
  data: Medicamento[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

export interface Venta {
  id: number;
  medicamento_id: number;
  nombre_medicamento: string;
  cantidad: number;
  valor_unitario: string;
  valor_total: string;
  fecha_hora: string;
}

export interface VentaCreada {
  message: string;
  ventaId: number;
  detalle: {
    medicamento: string;
    cantidad: number;
    valorUnitario: number;
    valorTotal: number;
    fechaHora: string;
  };
}

export interface ReporteStockBajo {
  criterioLimite: number;
  totalResultados: number;
  medicamentos: Medicamento[];
}

export interface ReporteVencidos {
  diasMargen: number;
  totalResultados: number;
  medicamentos: Medicamento[];
}

export interface ReporteVentas {
  rangoFechas: { fechaInicio: string; fechaFin: string };
  totalTransacciones: number;
  totalUnidadesVendidas: number;
  totalIngresos: number;
  ventasDetalle: Venta[];
}