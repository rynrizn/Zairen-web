/**
 * =====================================================================
 * ⛩️ TIPOS DE DATOS SUPABASE // ZAIREN LAB (PostgreSQL Schema)
 * =====================================================================
 */

export interface Configuracion {
  id: number;
  marca: string;
  slogan: string;
  logo_url: string;
  favicon_url: string;
  moneda_codigo: string;
  moneda_simbolo: string;
  whatsapp_numero: string;
  whatsapp_mensaje_template: string;
  sitio_url: string;
  seo_titulo: string;
  seo_descripcion: string;
  seo_imagen_og: string;
  redes_sociales: Array<{
    id: string;
    nombre: string;
    url: string;
    activo: boolean;
  }>;
  canales_contacto: Record<string, any>;
  politicas_envio: {
    envio_gratis_minimo: number;
    costo_envio_express: number;
    ciudades_cobertura: string[];
  };
  apariencia: Record<string, any>;
  estados_producto: Record<string, { texto: string; color: string }>;
  updated_at: string;
}

export interface Coleccion {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen_url?: string;
  orden: number;
  activa: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  precio_venta: number;
  stock_minimo: number;
  activo: boolean;
  publicado: boolean;
  destacado: boolean;
  es_prioritario: boolean;
  coleccion_id: string;
  created_at: string;
  updated_at: string;
  // Campos computados o relaciones
  coleccion?: Coleccion;
  imagenes?: Imagen[];
  atributos?: AtributoProducto[];
  stock_disponible?: number;
  imagen_portada?: string;
  tallas?: string[];
}

export interface AtributoProducto {
  id: string;
  producto_id: string;
  clave: string; // 'talla', 'tejido', 'construccion', 'estampado', 'sku'
  valor: string; // 'XL', 'Algodón Peinado 280 GSM'
  orden: number;
}

export interface Imagen {
  id: string;
  producto_id: string;
  url_imagen: string;
  public_id?: string;
  tipo: 'frontal' | 'dorsal' | 'detalle' | 'lookbook';
  es_portada: boolean;
  orden: number;
}

export interface Ubicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Inventario {
  id: string;
  producto_id: string;
  ubicacion_id: string;
  cantidad: number;
  cantidad_reservada: number;
  fecha_actualizacion: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  ci?: string;
  email?: string;
  ciudad?: string;
  direccion?: string;
  notas?: string;
  tipo_cliente: 'NUEVO' | 'HABITUAL';
  cantidad_compras: number;
  total_gastado: number;
  created_at: string;
  ultimo_contacto?: string;
}

export interface Pedido {
  id: string;
  numero_orden: number;
  cliente_id?: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  origen: 'CATALOGO_WEB' | 'WHATSAPP_DIRECTO' | 'INSTAGRAM' | 'PRESENCIAL';
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  estado_reserva: 'SIN_RESERVA' | 'RESERVADO' | 'LIBERADO' | 'CONFIRMADO';
  fecha_limite_reserva?: string;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  observacion?: string;
  created_at: string;
  updated_at: string;
  items?: DetallePedido[];
}

export interface DetallePedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  producto_nombre?: string;
  atributos_snapshot?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  numero_ticket: number;
  tipo_venta: 'DIRECTA' | 'POS' | 'PEDIDO_WEB';
  subtotal: number;
  descuento: number;
  total: number;
  observacion?: string;
  fecha_hora: string;
  cliente_id?: string;
  usuario_id: string;
  pedido_id?: string;
}

export interface Pago {
  id: string;
  monto: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'QR_SIMPLE' | 'HIBRIDO';
  tipo_pago: 'COMPLETO' | 'PARCIAL';
  estado_pago: 'PENDIENTE' | 'PAGADO';
  saldo_pendiente: number;
  monto_efectivo?: number;
  monto_transferencia?: number;
  referencia?: string;
  fecha_pago: string;
  venta_id?: string;
  pedido_id?: string;
}

export interface Perfil {
  id: string;
  nombre_completo: string;
  rol: 'SUPERADMIN' | 'ADMIN' | 'VENDEDOR' | 'VISOR';
  avatar_url?: string;
  activo: boolean;
  created_at: string;
}

export interface MovimientoInventario {
  id: string;
  tipo_movimiento: string;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  reservado_anterior: number;
  reservado_nuevo: number;
  fecha_hora: string;
  observacion?: string;
  producto_id: string;
  usuario_id?: string;
}
