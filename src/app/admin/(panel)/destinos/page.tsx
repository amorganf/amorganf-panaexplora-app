import CrudManager from "../../../components/admin/CrudManager";
import { query } from "../../../../lib/db";
export default async function Destinations() {
  const [p, c, d] = await Promise.all([
    query<{ id: string; name: string }>(
      `SELECT id,name FROM provinces ORDER BY name`,
    ),
    query<{ id: string; name: string }>(
      `SELECT id,name FROM categories WHERE active ORDER BY name`,
    ),
    query<{ id: string; name: string; province_id: string }>(
      `SELECT id,name,province_id FROM districts ORDER BY name`,
    ),
  ]);
  return (
    <CrudManager
      resource="destinations"
      title="Destinos turísticos"
      fields={[
        { name: "name", label: "Nombre", required: true },
        {
          name: "province_id",
          label: "Provincia",
          type: "select",
          required: true,
          options: p.rows.map((x) => ({ value: x.id, label: x.name })),
        },
        {
          name: "district_id",
          label: "Distrito (opcional)",
          type: "select",
          options: d.rows.map((x) => ({
            value: x.id,
            label: `${x.name} (provincia #${x.province_id})`,
          })),
        },
        {
          name: "category_id",
          label: "Categoría",
          type: "select",
          options: c.rows.map((x) => ({ value: x.id, label: x.name })),
        },
        { name: "excerpt", label: "Resumen", type: "textarea" },
        {
          name: "description",
          label: "Descripción",
          type: "textarea",
          required: true,
        },
        { name: "address", label: "Ubicación" },
        { name: "latitude", label: "Latitud", type: "number" },
        { name: "longitude", label: "Longitud", type: "number" },
        { name: "cover_image", label: "Imagen de portada (URL o subida)" },
        { name: "seo_title", label: "Título SEO (máximo 70 caracteres)" },
        {
          name: "seo_description",
          label: "Meta descripción SEO (máximo 170 caracteres)",
          type: "textarea",
        },
        { name: "seo_image", label: "Imagen para compartir (URL)" },
        {
          name: "seo_canonical",
          label: "URL canónica (opcional; https://...)",
        },
        {
          name: "status",
          label: "Estado",
          type: "select",
          required: true,
          options: [
            { value: "DRAFT", label: "Borrador" },
            { value: "PUBLISHED", label: "Publicado" },
            { value: "ARCHIVED", label: "Archivado" },
          ],
        },
        { name: "featured", label: "Destacado", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "province_name", label: "Provincia" },
        { key: "status", label: "Estado" },
        { key: "featured", label: "Destacado" },
      ]}
    />
  );
}
