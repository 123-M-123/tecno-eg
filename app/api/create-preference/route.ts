import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const { title, price, quantity, description } = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const preference = {
      items: [
        {
          title,
          quantity,
          unit_price: price,
          currency_id: 'ARS',
          description,
        },
      ],
      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/failure`,
        pending: `${baseUrl}/pending`,
      },
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