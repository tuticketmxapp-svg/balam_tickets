export interface Evento {
  id: number;
  name: string;
  numjuego: number | null;
  event_date: string;
  event_time: string;
  short_description: string;
  image_event_ticket: string;
  image_event_ticket_office: string;
  image_event_online: string;
  enclosure_name: string;
  tickets_sold: number | null;
  total_sales: number | null;
  tickets_available: number | null;
  sale_channel_ticket_office: number;
  sale_channel_online: number;
  general: number;
  inPresale: boolean;
  preventa: string;
  url_event: string;
  accesos: string[];
  zonePrices: ZonePrice[];
}

export interface ZonePrice {
  id: number;
  event_id: number;
  name: string;
  general: number;
  hex_color: string;
  commission: string;
  type_name: string;
  description: string;
  price: string;
  min_tickets: string;
  max_tickets: string;
  multiple: number;
  ticket_office: number;
  online: number;
  enabled: number;
  general_stock: number;
  current_stock: number;
  created_at: string;
  updated_at: string;
  section: string;
  access: string | null;
  entry: string;
  online_commission: string;
  deleted_at: string | null;
  descarga_activa: number;
}