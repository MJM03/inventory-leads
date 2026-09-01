# Inventory Leads

Dashboard ligero de prospección B2B para un negocio de inventarios físicos en Lima y Callao.

**Objetivo:** centralizar prospectos reales, señales de necesidad de inventario, teléfonos y canales públicos, posibles decisores, scoring comercial y avance del contacto.

## Abrir la web

👉 **https://mjm03.github.io/inventory-leads/**

## Firebase

La versión 10.5 usa Firebase Authentication y Cloud Firestore para mantener el
CRM sincronizado entre dispositivos. Los usuarios se administran desde Firebase
Authentication y solo las cuentas autenticadas pueden acceder al espacio
compartido `agp-inventory-leads`.

La primera cuenta que inicia sesión migra automáticamente el estado guardado en
el navegador. Las modificaciones posteriores se sincronizan en tiempo real y
generan registros de auditoría con usuario, fecha y prospecto afectado.

## V1

- Dashboard responsive para PC y móvil.
- Búsqueda y filtros por score, rubro y estado.
- Fichas detalladas de prospectos.
- Contactos públicos y fuentes verificables.
- Dos lecturas comerciales: potencial de inventario y accesibilidad.
- Pipeline: Nuevo → Por contactar → Contactado → Interesado → Cotización → Cliente.
- Estado compartido mediante Firebase, con respaldo local en el navegador.
- Datos iniciales reales de SuperPet, Promart, Casaideas Perú y Memory Kings.

## Próxima fase

La V2 conectará este frontend con el bot automático de prospección que buscará, deduplicará, enriquecerá y calificará nuevos leads desde la PC, manteniendo revisión humana antes del outreach.

> Los scores son indicadores internos. Que una empresa tenga señales operativas relacionadas con inventario no significa que esté buscando tercerizar el servicio actualmente.
