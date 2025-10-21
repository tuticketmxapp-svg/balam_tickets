// Interfaz para el objeto detallado de un evento
export interface EventoDetalle {
  id: number;
  name: string;
  numjuego: number | null;
  status: number;
  sale_channel_ticket_office: number;
  sale_channel_online: number;
  currency_id: string;
  event_status_id: number;
  event_type_id: number;
  event_date: string;
  event_time: string;
  end_event_date: string;
  end_event_time: string;
  short_description: string;
  long_description: string;
  tags: string | null;
  qr_code: string;
  image_event_online: string;
  image_event_ticket_office: string;
  image_event_ticket: string;
  image_event_digital: string;
  image_event_banner: string;
  map_enabled: number;
  enclosure_id: number;
  promoter_id: number;
  max_boletos_online: number;
  isPresale: boolean;
  saleOnlineActive: boolean;
  url_event: string;
  descarga_activa: boolean;
  enclosure_name: string;
  enclosure_address: string;
  zone_prices: ZonePriceDetalle[];
  // ... y cualquier otro campo que necesites del objeto detallado
}

// Interfaz para las zonas de precio del evento detallado
export interface ZonePriceDetalle {
  id: number;
  name: string;
  description: string;
  section: string;
  access: string | null;
  entry: string;
  price: string;
  min: string;
  max: string;
  multiple: number;
  hex_color: string;
  commission: string;
  online_commission: string;

  // Propiedades que añadimos en la UI para la lógica de compra
  titulo?: string;
  subtitulo?: string;
  current_stock?: number;
  types?: string[];
  cantidad?: number;
}