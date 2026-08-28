import type { CartLineItem } from "./cart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
  readonly lineTotal: number;
}

export interface Order {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
}

/** Helper to snapshot a CartLineItem into an OrderItem (freezes price at order time). */
export function toOrderItem(line: CartLineItem): OrderItem {
  return {
    productId: line.productId,
    name: line.name,
    price: line.price,
    quantity: line.quantity,
    lineTotal: line.lineTotal,
  };
}
