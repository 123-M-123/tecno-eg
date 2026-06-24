import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  precioTransfer: number;
  imagen: string;
  cantidad: number;
  categoria?: string;
}

interface ClientData {
  nombre: string;
  whatsapp: string;
  direccion: string;
  metodoEntrega: 'envio' | 'retiro';
}

interface CartStore {
  items: CartItem[];
  clientData: ClientData;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  setClientData: (data: Partial<ClientData>) => void;
  getTotal: () => number;
  isClientDataComplete: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      clientData: {
        nombre: '',
        whatsapp: '',
        direccion: '',
        metodoEntrega: 'retiro',
      },

      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...item, cantidad: 1 }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, cantidad) => {
        if (cantidad <= 0) { get().removeItem(id); return; }
        set({ items: get().items.map((i) => (i.id === id ? { ...i, cantidad } : i)) });
      },

      clearCart: () => set({ items: [] }),

      setClientData: (data) =>
        set((state) => ({
          clientData: { ...state.clientData, ...data },
        })),

      getTotal: () => get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),

      isClientDataComplete: () => {
        const { nombre, whatsapp, metodoEntrega, direccion } = get().clientData;
        if (metodoEntrega === 'envio') {
          return nombre.length > 2 && whatsapp.length > 7 && direccion.length > 5;
        }
        return nombre.length > 2 && whatsapp.length > 7;
      },
    }),
    { name: 'tecno-eg-cart-storage' }
  )
);