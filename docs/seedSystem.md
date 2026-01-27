# Seed system Module

## Descripción 

Sistema de carga inicial de datos para pruebas y desarrollo.
Permite poblar el emulador de Firestore con:

- Categorías
- Inventario base

---

### Ejecución

Desde la carpeta functions:

npm run seed

---

### Qué crea

- Categorías iniciales
- Inventarion con distintos tipos de productos
- IDs personalizados (no autogenerdados)

Ejemplo de item generado: 

```json
{
  "id": "swarovski-mix",
  "name": "Cristales Swarovski Mix",
  "stockPieces": 425
}
```
---

### Propósito

| **Uso** | **Motivo** |
| ----- | ------------- |
| Desarrollo | No crear datos manualmente |
| Pruebas | Escenarios reales |
| Demostraciones | Mostrar sistemas funcionando |

---

## Relación entre módulos

Categories
     ↓
Inventory Items
     ↓
Inventory Movements

Las categorías organizan los items,
los items almacenan el stock,
los movements modifican ese stock.

## Estado del backend

| Modulo | Estado |
| ---- | ----------- |
| Categories | ✅ |
| Inventory | ✅ |
| Inventory Movements | ✅ |
| Seed System | ✅ |