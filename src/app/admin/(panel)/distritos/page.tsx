import CrudManager from "../../../components/admin/CrudManager";
import { query } from "../../../../lib/db";
export default async function Districts() {
  const { rows } = await query<{ id: string; name: string }>(
    "SELECT id,name FROM provinces ORDER BY name",
  );
  return (
    <CrudManager
      resource="districts"
      title="Distritos"
      fields={[
        {
          name: "province_id",
          label: "Provincia",
          type: "select",
          required: true,
          options: rows.map((r) => ({ value: r.id, label: r.name })),
        },
        { name: "name", label: "Nombre", required: true },
      ]}
      columns={[
        { key: "name", label: "Distrito" },
        { key: "province_name", label: "Provincia" },
        { key: "slug", label: "Slug" },
      ]}
    />
  );
}
