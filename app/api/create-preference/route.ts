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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://tecno-eg.vercel.app';

    // Soporta tanto carrito nuevo (items array) como llamada vieja (producto único)
    let items: ItemCarrito[];

    if (body.items && Array.isArray(body.items)) {
      // Carrito nuevo → array de productos
      items = body.items.map((i: ItemCarrito) => ({
        id:          i.id,
        title:       i.title,
        quantity:    i.quantity,
        unit_price:  i.unit_price,
        currency_id: 'ARS',
      }));
    } else {
      // Formato viejo → producto único (compatibilidad)
      items = [{
        id:          '1',
        title:       body.title,
        quantity:    body.quantity,
        unit_price:  body.price,
        currency_id: 'ARS',
        description: body.description,
      }];
    }

    const preference = {
      items,
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