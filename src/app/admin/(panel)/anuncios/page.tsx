import CrudManager from "../../../components/admin/CrudManager";
export default function Ads() {
  return (
    <CrudManager
      resource="ads"
      title="Espacios publicitarios"
      fields={[
        { name: "name", label: "Nombre", required: true },
        {
          name: "location",
          label: "Identificador único (ej. home_top)",
          required: true,
        },
        { name: "ad_code", label: "Código de anuncio", type: "textarea" },
        { name: "active", label: "Activo", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "location", label: "Ubicación" },
        { key: "active", label: "Activo" },
      ]}
    />
  );
}
