import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered";

export interface TrackedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface TrackedOrder {
  orderId: string;
  items: TrackedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  deliveryAddress: string;
  promoCode: string | null;
  status: OrderStatus;
  estimatedDelivery: string;
  createdAt: string;
}

interface OrderStoreState {
  activeOrder: TrackedOrder | null;
  orderHistory: TrackedOrder[];
  setActiveOrder: (order: TrackedOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearActiveOrder: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set) => ({
      activeOrder: null,
      orderHistory: [],

      setActiveOrder: (order) =>
        set((state) => ({
          activeOrder: order,
          orderHistory: [
            order,
            ...state.orderHistory.filter((o) => o.orderId !== order.orderId),
          ],
        })),

      updateOrderStatus: (orderId, status) =>
        set((state) => {
          const updatedActive =
            state.activeOrder?.orderId === orderId
              ? { ...state.activeOrder, status }
              : state.activeOrder;

          const updatedHistory = state.orderHistory.map((o) =>
            o.orderId === orderId ? { ...o, status } : o,
          );

          return {
            activeOrder: updatedActive,
            orderHistory: updatedHistory,
          };
        }),

      clearActiveOrder: () => set({ activeOrder: null }),
    }),
    {
      name: "freshcart-orders",
    },
  ),
);
