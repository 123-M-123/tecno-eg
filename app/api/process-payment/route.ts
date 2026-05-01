import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('FormData recibido:', JSON.stringify(formData, null, 2));

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ ...formData, differential_pricing_id: undefined }),
    });

    const data = await response.json();
    
    console.log('Respuesta MP:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // ── Notificar webhook si el pago fue aprobado ──
    if (data.status === 'approved') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      try {
        await fetch(`${baseUrl}/api/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment',
            data: { id: data.id }
          })
        })
        console.log('Webhook notificado OK para pago:', data.id)
      } catch (webhookError) {
        // Si el webhook falla, el pago igual se devuelve OK
        console.error('Error notificando webhook:', webhookError)
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Error procesando el pago' },
      { status: 500 }
    );
  }
}