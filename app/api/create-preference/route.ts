import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

type ItemCarrito = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  description?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecno-eg.vercel.app';

    // 1. CAPTURAMOS EL MAIL (Para que la Columna A no diga "Sin Identificar")
    const vendedorEmail = body.vendedorEmail || "mguiyemo@gmail.com";

    // 2. MANTENEMOS TU LÓGICA DE CARRITO (No rompemos nada)
    let items: ItemCarrito[];

    if (body.items && Array.isArray(body.items)) {
      // Formato Carrito (Array)
      items = body.items.map((i: ItemCarrito) => ({
        id:          i.id,
        title:       i.title,
        quantity:    Number(i.quantity),
        unit_price:  Number(i.unit_price),
        currency_id: 'ARS',
      }));
    } else {
      // Formato Producto Único (Compatibilidad)
      items = [{
        id:          '1',
        title:       body.title,
        quantity:    Number(body.quantity || 1),
        unit_price:  Number(body.price || 0),
        currency_id: 'ARS',
        description: body.description,
      }];
    }

    // 3. CONSTRUIMOS LA PREFERENCIA CON EL EXTERNAL_REFERENCE
    const preference = {
      items,
      // ESTA LÍNEA ES LA QUE ARREGLA TU EXCEL:
      external_reference: vendedorEmail, 
      
      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/failure`,
        pending: `${baseUrl}/pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago API Error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: 'Error creating preference' },
      { status: 500 }
    );
  }
}