import CrudManager from "../../../components/admin/CrudManager";
export default function Users() {
  return (
    <CrudManager
      resource="users"
      title="Usuarios"
      fields={[
        { name: "name", label: "Nombre", required: true },
        { name: "username", label: "Usuario", required: true },
        { name: "email", label: "Correo", type: "email", required: true },
        {
          name: "password",
          label: "Contraseña (obligatoria al crear; opcional al editar)",
          type: "password",
        },
        {
          name: "role",
          label: "Rol",
          type: "select",
          required: true,
          options: [
            { value: "ADMIN", label: "Administrador" },
            { value: "EDITOR", label: "Editor" },
            { value: "SUPERADMIN", label: "Superadministrador" },
          ],
        },
        { name: "active", label: "Activo", type: "checkbox" },
      ]}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "username", label: "Usuario" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "active", label: "Activo" },
      ]}
    />
  );
}
