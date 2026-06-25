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
  // Estado del Modal
  modalOpen: boolean;
  activeProduct: any | null;
  productList: any[];
  activeIndex: number;
  
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  setClientData: (data: Partial<ClientData>) => void;
  getTotal: () => number;
  isClientDataComplete: () => boolean;
  
  // Acciones del Modal
  openModal: (product: any, list?: any[], index?: number) => void;
  closeModal: () => void;
  navigateModal: (direction: 'next' | 'prev') => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      clientData: { nombre: '', whatsapp: '', direccion: '', metodoEntrega: 'retiro' },
      modalOpen: false,
      activeProduct: null,
      productList: [],
      activeIndex: -1,

      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        if (existingItem) {
          set({ items: currentItems.map((i) => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i) });
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
      setClientData: (data) => set((state) => ({ clientData: { ...state.clientData, ...data } })),
      getTotal: () => get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
      isClientDataComplete: () => {
        const { nombre, whatsapp, metodoEntrega, direccion } = get().clientData;
        return metodoEntrega === 'envio' 
          ? nombre.length > 2 && whatsapp.length > 7 && direccion.length > 5
          : nombre.length > 2 && whatsapp.length > 7;
      },

      // LÓGICA DEL MODAL
      openModal: (product, list = [], index = -1) => set({
        modalOpen: true,
        activeProduct: product,
        productList: list,
        activeIndex: index
      }),
      closeModal: () => set({ modalOpen: false, activeProduct: null }),
      navigateModal: (direction) => {
        const { activeIndex, productList } = get();
        if (productList.length === 0) return;
        let newIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
        if (newIndex >= 0 && newIndex < productList.length) {
          set({ activeIndex: newIndex, activeProduct: productList[newIndex] });
        }
      }
    }),
    { name: 'tecno-eg-cart-storage' }
  )
);