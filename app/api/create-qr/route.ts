import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titulo, precio } = body;

    if (!titulo || !precio) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!MP_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'MP_ACCESS_TOKEN no configurado' }, { status: 500 });
    }

    // ── Crear preferencia ─────────────────────────
    const preference = {
      items: [
        {
          title: titulo,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(precio),
        },
      ],
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('MP ERROR:', data);
      return NextResponse.json({ error: 'Error creando preferencia' }, { status: 500 });
    }

    const link = data.init_point;

    // ── GENERAR QR BASE64 ─────────────────────────
    const qrBase64 = await QRCode.toDataURL(link);

    return NextResponse.json({
      qr: qrBase64, // 👈 esto es la imagen
      link,         // 👈 por si lo querés usar también
    });

  } catch (error) {
    console.error('ERROR:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}