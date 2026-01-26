#  Inventory Module

## Descripción

Gestiona los productos del inventario.
El sistema soporta múltiples tipos de inventario, no todos se manejan igual.

---

## Tipos de inventario soportados

| **Tipo** | **Uso** | **Campo de stock** |
|------|------------|----------|
| Consumibles por pieza | Limas, guantes, cristales | stockPieces |
| Consumibles por contenido | Monómero, gel, líquidos | currentStock |
| Equipo | Drill, lámparas | No maneja stock |

---

## Arquitectura 

inventory

 ├── inventory.model.ts

 ├── inventory.repository.ts

 ├── inventory.service.
 
 ├── inventory.controller.ts

 └── inventory.routes.ts

 ---

 ## Endpoints

 ### Obtener inventario

 ```json
 GET /api/inventory-items
```

### Crear item

 ```json
POST /api/inventory-items
```

Ejemplo consumible por piezas:

```json
{
  "id": "lima-100-180",
  "name": "Lima 100/180",
  "categoryId": "limas-pulidores",
  "purchaseCost": 150,
  "stockPieces": 50,
  "minStockPieces": 10
}
```

Ejemplo químico:

```json
{
  "id": "monomero",
  "name": "Monómero",
  "categoryId": "acrilicos",
  "purchaseCost": 500,
  "totalContent": 500,
  "currentStock": 425,
  "minStock": 100
}
```

### Colección

inventoryItems
