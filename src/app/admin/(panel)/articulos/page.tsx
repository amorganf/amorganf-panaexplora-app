import CrudManager from "../../../components/admin/CrudManager";

import { query } from "../../../lib/db";
export default async function Articles() {
  const [categories, provinces] = await Promise.all([
    query<{ id: string; name: string }>(
      "SELECT id,name FROM categories WHERE active ORDER BY name",
    ),
    query<{ id: string; name: string }>(
      "SELECT id,name FROM provinces ORDER BY name",
    ),
  ]);
  return (
    <CrudManager
      resource="articles"
      title="Artículos del blog"
      fields={[
        { name: "title", label: "Título", required: true },
        {
          name: "category_id",
          label: "Categoría",
          type: "select",
          options: categories.rows.map((x) => ({ value: x.id, label: x.name })),
        },
        {
          name: "province_id",
          label: "Ubicación / provincia",
          type: "select",
          options: provinces.rows.map((x) => ({ value: x.id, label: x.name })),
        },
        { name: "excerpt", label: "Resumen", type: "textarea" },
        {
          name: "content",
          label: "Contenido",
          type: "textarea",
          required: true,
        },
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
        { key: "title", label: "Título" },
        { key: "author_name", label: "Autor" },
        { key: "category_name", label: "Categoría" },
        { key: "province_name", label: "Ubicación" },
        { key: "status", label: "Estado" },
      ]}
    />
  );
}
