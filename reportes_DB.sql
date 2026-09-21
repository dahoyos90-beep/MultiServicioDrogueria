CREATE DATABASE IF NOT EXISTS reportes_db;
USE reportes_db;

CREATE TABLE IF NOT EXISTS historial_reportes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);