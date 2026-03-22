import fs from 'fs';
import path from 'path';

export interface Product {
  id_producto: string;
  titulo: string;
  precio: number;
  descripcion: string;
  imagen?: string;
  categoria?: string;
  etiqueta?: string;
  stock?: number;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'productos', 'productos.json');
    if (!fs.existsSync(filePath)) return [];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}