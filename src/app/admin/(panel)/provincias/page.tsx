import CrudManager from "../../../components/admin/CrudManager";
export default function Provinces() {
  return (
    <CrudManager
      resource="provinces"
      title="Provincias y comarcas"
      fields={[
        { name: "name", label: "Nombre", required: true },
        { name: "description", label: "Descripción", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "slug", label: "Slug" },
      ]}
    />
  );
}
