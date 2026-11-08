import CrudManager from "../../../components/admin/CrudManager";

import { query } from "../../../lib/db";
export default async function Gallery() {
  const { rows } = await query<{ id: string; name: string }>(
    "SELECT id,name FROM destinations ORDER BY name",
  );
  return (
    <CrudManager
      resource="gallery"
      title="Galería de destinos"
      fields={[
        {
          name: "destination_id",
          label: "Destino",
          type: "select",
          required: true,
          options: rows.map((r) => ({ value: r.id, label: r.name })),
        },
        { name: "image_url", label: "URL de imagen", required: true },
        { name: "alt_text", label: "Texto alternativo" },
        { name: "caption", label: "Pie de foto" },
        { name: "sort_order", label: "Orden", type: "number" },
      ]}
      columns={[
        { key: "destination_name", label: "Destino" },
        { key: "image_url", label: "Imagen" },
        { key: "caption", label: "Pie de foto" },
        { key: "sort_order", label: "Orden" },
      ]}
    />
  );
}
