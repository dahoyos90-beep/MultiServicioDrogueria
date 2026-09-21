CREATE DATABASE IF NOT EXISTS medicamentos_db;
USE medicamentos_db;

CREATE TABLE IF NOT EXISTS medicamentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    laboratorio_fabrica VARCHAR(150) NOT NULL,
    fecha_fabricacion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_stock INT NOT NULL CHECK (cantidad_stock >= 0),
    valor_unitario DECIMAL(12, 2) NOT NULL CHECK (valor_unitario >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );