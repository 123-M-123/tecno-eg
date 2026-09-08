import { NextRequest, NextResponse } from "next/server";

/**
 * CREACIÓN DE PREFERENCIA DE CHECKOUT - TECNO EG
 * =========================================================================
 * Arquitectura Híbrida:
 * 1. Intenta obtener el Access Token dinámico de Tecno EG desde tdt.ar (Supabase).
 * 2. Si Tecno EG todavía no conectó su cuenta, usa el Fallback de Marcos
 *    configurado en Vercel (process.env.MP_ACCESS_TOKEN).
 * 3. Mantiene intacta la lógica de carrito y la inyección del correo en
 *    external_reference para el registro contable en Google Sheets.
 */

// Fallback de seguridad: Tu cuenta personal de Marcos cargada en Vercel de Tecno EG
const FALLBACK_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";

// Identificador único de Tecno EG registrado en la Planilla Maestra de TdT
const TECNO_EG_GAID = process.env.GA_ID || "534564663";

// Secreto interno para comunicarse con la Nave Nodriza (tdt.ar)
const INTERNAL_SECRET = process.env.TIENDAS_INTERNAL_SECRET || "tdt-secure-bridge-2026";

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tecno-eg.vercel.app";

    // 1. CAPTURAMOS EL MAIL (Para que la Columna A del Excel no diga "Sin Identificar")
    const vendedorEmail = body.vendedorEmail || "mguiyemo@gmail.com";

    // 2. RESOLUCIÓN DINÁMICA DEL ACCESS TOKEN (Consulta a la Nave Nodriza TdT)
    let tokenActivo = FALLBACK_ACCESS_TOKEN;
    let origenToken = "FALLBACK_MARCOS";

    try {
      // Petición ultrarrápida a tdt.ar con timeout de 3 segundos para que el checkout no se demore
      const resToken = await fetch(`https://tdt.ar/api/tiendas/mp-token?gaId=${TECNO_EG_GAID}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-store",
          "x-tiendas-secret": INTERNAL_SECRET,
        },
        signal: AbortSignal.timeout(3000),
      });

      if (resToken.ok) {
        const dataToken = await resToken.json();
        // Si Tecno EG tiene credenciales vigentes en Supabase, las priorizamos al 100%
        if (dataToken.success && dataToken.access_token) {
          tokenActivo = dataToken.access_token;
          origenToken = "OFICIAL_TECNO_EG";
        }
      }
    } catch (errToken) {
      console.warn(
        `[CHECKOUT TECNO-EG] No se pudo consultar tdt.ar. Usando token de fallback. Detalle:`,
        errToken
      );
    }

    // Validación de seguridad antes de llamar a Mercado Pago
    if (!tokenActivo) {
      console.error("[CHECKOUT TECNO-EG] Error crítico: No hay ningún token disponible (ni propio ni fallback).");
      return NextResponse.json(
        { error: "Medio de pago no configurado actualmente. Por favor coordinar por WhatsApp." },
        { status: 500 }
      );
    }

    console.log(`[CHECKOUT TECNO-EG] Procesando preferencia con credencial: [${origenToken}]`);

    // 3. MANTENEMOS TU LÓGICA DE CARRITO (No se altera la estructura de items)
    let items: ItemCarrito[];

    if (body.items && Array.isArray(body.items)) {
      // Formato Carrito (Array múltiple)
      items = body.items.map((i: ItemCarrito) => ({
        id:          i.id,
        title:       i.title,
        quantity:    Number(i.quantity),
        unit_price:  Number(i.unit_price),
        currency_id: "ARS",
      }));
    } else {
      // Formato Producto Único (Compatibilidad legacy)
      items = [
        {
          id:          "1",
          title:       body.title,
          quantity:    Number(body.quantity || 1),
          unit_price:  Number(body.price || 0),
          currency_id: "ARS",
          description: body.description,
        },
      ];
    }

    // 4. CONSTRUIMOS LA PREFERENCIA CON EL EXTERNAL_REFERENCE PARA EXCEL
    const preference = {
      items,
      // Esta línea preserva la imputación contable a la planilla de Google Sheets:
      external_reference: vendedorEmail,

      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/failure`,
        pending: `${baseUrl}/pending`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhook`,
    };

    // 5. ENVÍO DIRECTO A MERCADO PAGO UTILIZANDO EL TOKEN RESUELTO
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenActivo}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[CHECKOUT TECNO-EG] Mercado Pago API Error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CHECKOUT TECNO-EG] Error creating preference:", error);
    return NextResponse.json(
      { error: "Error creating preference" },
      { status: 500 }
    );
  }
}