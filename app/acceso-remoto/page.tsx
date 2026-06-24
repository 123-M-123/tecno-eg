import { redirect } from 'next/navigation';

export default function AccesoRemotoPage() {
  // Redirige automáticamente a la Home, al anclaje #quienes que vimos en tu HeroSection
  redirect('/#quienes');
  
  // No renderiza nada
  return null;
}