#  Categorie Module

## Descripción 
Gestiona las categorías del sistema de inventario.
Permite organizar productos por tipo de uso dentro del salón.

Ejemplos: 

- Acrílicos
- Geles
- Limas
- Desechables
- Equipo eléctrico

---

## Arquitectura

categories

 ├── Category.model.ts

 ├── Category.repository.ts

 ├── Category.service.ts

 ├── Category.controller.ts

 └── Category.routes.ts

---

## Endpoints

### Obtener categorías

**GET**

```json
/api/categories
```
### Crear categorías

**POST**

```json
/api/categories
```

#### Body

```json
{
  "id": "acrilicos",
  "name": "Acrílicos",
  "superCategory": "QUIMICOS_GELES"
}
```

---

### Modelo

| **Campo** | **Tipo** | **Descripción** |
|------|------------|----------|
| *id* | string | Identificador único |
| *name* | string | Nombre visible |
| *superCategory* | string | Grupo contable/operativo |

---

### Colección 

```json
categories
```