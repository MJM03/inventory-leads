# Inventory Leads

Dashboard ligero de prospección B2B para un negocio de inventarios físicos en Lima y Callao.

**Objetivo:** centralizar prospectos reales, señales de necesidad de inventario, teléfonos y canales públicos, posibles decisores, scoring comercial y avance del contacto.

## Abrir la web

👉 **https://mjm03.github.io/inventory-leads/**

## Firebase · V10.6

Inventory Leads usa Firebase Authentication y Cloud Firestore para mantener el CRM sincronizado entre dispositivos y usuarios.

La primera cuenta autorizada del workspace queda como Administrador. Desde el botón de sesión del encabezado se puede abrir **Equipo AGP**, ver miembros, roles y cantidad de prospectos asignados. El Administrador puede autorizar o desactivar miembros utilizando el UID de una cuenta creada previamente en Firebase Authentication.

Roles disponibles:

- **Administrador:** acceso completo, gestión de miembros y asignaciones.
- **Supervisor:** trabajo completo sobre el CRM y asignación de prospectos, sin poder modificar miembros.
- **Vendedor:** trabajo comercial sobre el CRM, sin poder modificar miembros ni asignaciones.

Cada ficha de prospecto incorpora un responsable. Las asignaciones se sincronizan junto al resto del estado y los cambios generan auditoría con UID, correo, rol, fecha y entidad afectada.

La sincronización remota intenta actualizar las vistas activas sin recargar toda la página. Se mantiene una recarga inicial controlada al establecer por primera vez una sesión para garantizar que el CRM arranque desde el estado compartido de Firestore.

### Reglas de Firestore

El repositorio incluye `firestore.rules` con control de acceso por membresía y rol. **Modificar este archivo en GitHub no publica automáticamente las reglas en Firebase**: deben desplegarse en el proyecto `inventory-leads` mediante Firebase CLI o desde la consola antes de considerar activos los permisos V10.6.

La primera migración desde V10.5 añade `ownerUid` y `members` al workspace existente. Después de esa migración, una cuenta autenticada que no figure como miembro activo no puede acceder al CRM cuando las reglas V10.6 estén desplegadas.

## Funciones principales

- Dashboard responsive para PC y móvil.
- Búsqueda y filtros por score, rubro y estado.
- Fichas detalladas de prospectos.
- Contactos públicos y fuentes verificables.
- Dos lecturas comerciales: potencial de inventario y accesibilidad.
- Pipeline: Nuevo → Por contactar → Contactado → Interesado → Cotización → Cliente.
- Estado compartido mediante Firebase, con respaldo local en el navegador.
- Login por correo y contraseña.
- Roles y membresía de equipo.
- Asignación de prospectos.
- Auditoría de cambios.

## Próxima fase

La siguiente evolución puede separar el estado monolítico actual en documentos por prospecto/oportunidad para permitir reglas aún más granulares —por ejemplo, restringir a cada vendedor para que solo pueda leer o escribir los prospectos asignados— sin depender de mapas globales de estado.

> Los scores son indicadores internos. Que una empresa tenga señales operativas relacionadas con inventario no significa que esté buscando tercerizar el servicio actualmente.
