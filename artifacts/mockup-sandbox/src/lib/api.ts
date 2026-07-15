const API_BASE = "/api";

export interface MenuItem {
  id: string;
  name: string;
  category: "breads" | "pastries" | "cakes" | "cookies" | "drinks";
  description: string;
  price: number;
  image: string;
  tags: string[];
  available: boolean;
  averageRating: number | null;
  ratingCount: number;
}

export interface MenuResponse {
  items: MenuItem[];
}

export async function fetchMenu(): Promise<MenuResponse> {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function rateItem(
  id: string,
  rating: number,
): Promise<{ success: boolean; averageRating: number; ratingCount: number }> {
  const res = await fetch(`${API_BASE}/menu/${id}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) throw new Error("Failed to submit rating");
  return res.json();
}

export interface BulkOrderPayload {
  name: string;
  email: string;
  phone: string;
  items: { itemId: string; name: string; quantity: number }[];
  pickupDate: string;
  notes?: string;
}

export async function submitBulkOrder(
  payload: BulkOrderPayload,
): Promise<{ success: boolean; orderId: string; message: string }> {
  const res = await fetch(`${API_BASE}/orders/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit order");
  return res.json();
}

export interface CateringPayload {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  requirements: string;
  budget: string;
}

export async function submitCateringRequest(
  payload: CateringPayload,
): Promise<{ success: boolean; requestId: string; message: string }> {
  const res = await fetch(`${API_BASE}/orders/catering`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit catering request");
  return res.json();
}
