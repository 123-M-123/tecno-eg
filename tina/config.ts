import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "YOUR_CLIENT_ID",
  token: "YOUR_TOKEN",
  build: {
  outputFolder: "admin",
  publicFolder: "public",
},
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        label: "Productos",
        name: "productos",
        path: "content/productos",
        format: "json",
        fields: [
          {
            type: "string",
            label: "Título",
            name: "titulo",
            isTitle: true,
            required: true,
          },
          {
            type: "number",
            label: "Precio",
            name: "precio",
            required: true,
          },
          {
            type: "string",
            label: "Categoría",
            name: "categoria",
          },
          {
            type: "string",
            label: "Descripción",
            name: "descripcion",
          },
          {
            type: "image",
            label: "Imagen",
            name: "imagen",
          },
        ],
      },
    ],
  },
});