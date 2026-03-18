import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const { title, price, quantity, description } = await request.json();

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
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pending`,
      },
      auto_return: 'approved',
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { error: 'Error creating preference' },
      { status: 500 }
    );
  }
}