'use client';
import { useConfigStore } from '@/store/useConfigStore';

export default function ConfigStyles() {
  const { config } = useConfigStore();

  return (
    <style jsx global>{`
      :root {
        /* COLORES */
        --color-oscuro-1: ${config.Color_Oscuro1 || '#1e1e1e'};
        --color-oscuro-2: ${config.Color_Oscuro2 || '#111111'};
        --color-medio-1: ${config.Color_Medio1 || '#630d16'};
        --color-medio-2: ${config.Color_Medio2 || '#f37021'};
        --color-claro-1: ${config.Color_Claro1 || '#f7f6f3'};
        
        /* UI & LAYOUT */
        --radius-ui: ${config.Button_Radius || '12'}px;
        --grid-gap: ${config.Grid_Gap || '20'}px;
        --max-width: ${config.Max_Container_Width || '1200'}px;
        --header-height: ${config.Footer_Height || '80'}px;
        
        /* TIPOGRAFÍA */
        --font-size-base: ${config.Font_Size_Global || '16'}px;
        --letter-spacing: ${config.Letter_Spacing || '0'}px;
        --line-height: ${config.Line_Height || '1.5'};
        
        /* Z-INDEX (Escudo de profundidad) */
        --z-header: ${config.Z_Index_Header || '100'};
        --z-modal: ${config.Z_Index_Modal || '200'};
        --z-wa: ${config.Z_Index_Wa || '150'};

        /* BOTON WA FLOAT */
        --wa-size: ${config.Floating_WA_Size || '60'}px;
        --wa-bottom: ${config.Wa_Button_Y || '20'}px;
      }

      body {
        font-size: var(--font-size-base);
        background-color: var(--color-claro-1);
        color: var(--color-oscuro-1);
        letter-spacing: var(--letter-spacing);
        line-height: var(--line-height);
      }

      button {
        border-radius: var(--radius-ui);
        transition: transform ${config.Animation_Speed || '0.3'}s ease;
      }

      button:hover {
        transform: scale(${config.Hover_Scale || '1.05'});
      }
    `}</style>
  );
}