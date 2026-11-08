import CrudManager from "../../../components/admin/CrudManager";
export default function Categories() {
  return (
    <CrudManager
      resource="categories"
      title="Categorías"
      fields={[
        { name: "name", label: "Nombre", required: true },
        { name: "description", label: "Descripción", type: "textarea" },
        { name: "seo_title", label: "Título SEO" },
        {
          name: "seo_description",
          label: "Meta descripción SEO",
          type: "textarea",
        },
        { name: "seo_image", label: "Imagen social (URL)" },
        { name: "seo_canonical", label: "URL canónica (https://...)" },
        { name: "active", label: "Activa", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "slug", label: "Slug" },
        { key: "active", label: "Activa" },
      ]}
    />
  );
}
