import { NextResponse } from 'next/server'
import productos from '@/content/productos.json'

export async function GET() {
  return NextResponse.json(productos)
}