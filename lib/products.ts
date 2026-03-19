import fs from 'fs';
import path from 'path';

export interface Product {
  id: string
  titulo: string
  precio: number
  descripcion: string
  imagen?: string
  categoria?: string
}

export async function getProducts(): Promise<Product[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'productos');

    if (!fs.existsSync(contentDir)) {
      console.log('Content directory does not exist');
      return [];
    }

    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.json'));

    const products: Product[] = files.map(file => {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      return {
        id: file.replace('.json', ''),
        titulo: data.titulo,
        precio: data.precio,
        descripcion: data.descripcion,
        imagen: data.imagen,
        categoria: data.categoria,
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}