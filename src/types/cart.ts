/**
 * A single item in the cart.
 *
 * Stores only the product ID and quantity — never a snapshot of the
 * product object.  The authoritative product data (price, stock,
 * existence) is always looked up from the current dataset at read time.
 */
export interface CartItem {
  readonly productId: string;
  quantity: number;
}

/** Derived view used by UI components — joins a CartItem with live product data. */
export interface CartLineItem {
  readonly productId: string;
  readonly name: string;
  readonly price: number;
  readonly unit: string;
  readonly image: string;
  readonly stock: number;
  readonly quantity: number;
  readonly lineTotal: number;
}

export interface CartSummary {
  readonly items: readonly CartLineItem[];
  readonly subtotal: number;
  readonly itemCount: number;
}
