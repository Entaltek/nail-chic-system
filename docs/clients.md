# Clients Module API

## Descripcion

Modulo para la gestion de clientes.
Incluye alta, consulta, actualizacion y baja logica.

---

## Base route

`/clients`

---

## Endpoints

### 1 Obtener todos los clientes

- Metodo: `GET`
- Ruta: `/clients`
- Respuesta: `200 OK`

```json
{
  "success": true,
  "data": []
}
```

### 2 Obtener cliente por ID

- Metodo: `GET`
- Ruta: `/clients/:id`
- Respuesta exitosa: `200 OK`
- Si no existe: `404 Not Found`

```json
{
  "success": false,
  "message": "Cliente no encontrado"
}
```

### 3 Crear cliente

- Metodo: `POST`
- Ruta: `/clients`
- Validacion: `validateBody(createClientSchema)`
- Respuesta exitosa: `201 Created`

Body esperado:

```json
{
  "nombre": "Ana",
  "ap_paterno": "Lopez",
  "ap_materno": "Garcia",
  "correo": "ana@email.com",
  "telefono": "5512345678",
  "tipo": "nuevo"
}
```

Reglas de validacion:

- `nombre`: obligatorio
- `ap_paterno`: obligatorio
- `ap_materno`: opcional
- `correo`: obligatorio y formato email valido
- `telefono`: obligatorio y 10 digitos
- `tipo`: solo `nuevo` o `frecuente`

Respuesta exitosa:

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "nombre": "Ana",
    "ap_paterno": "Lopez",
    "ap_materno": "Garcia",
    "correo": "ana@email.com",
    "telefono": "5512345678",
    "tipo": "nuevo",
    "citas_count": 0,
    "servicios_count": 0,
    "status": "activo",
    "createdAt": "2026-02-24T20:00:00.000Z",
    "updatedAt": "2026-02-24T20:00:00.000Z"
  }
}
```

Error de validacion:

- Codigo: `400 Bad Request`

```json
{
  "success": false,
  "message": "Error de validacion",
  "errors": [
    {
      "field": "correo",
      "message": "El correo no tiene un formato valido"
    }
  ]
}
```

### 4 Actualizar cliente

- Metodo: `PUT`
- Ruta: `/clients/:id`
- Validacion: `validateBody(createClientSchema)`
- Respuesta exitosa: `200 OK`
- Si no existe: `404 Not Found`

```json
{
  "success": false,
  "message": "Cliente no encontrado para actualizar"
}
```

### 5 Eliminar cliente (baja logica)

- Metodo: `DELETE`
- Ruta: `/clients/:id`
- Respuesta exitosa: `200 OK`
- Si no existe: `404 Not Found`

```json
{
  "success": true,
  "message": "Cliente eliminado correctamente"
}
```

---

## Estandar de respuestas

En este modulo se usa estructura JSON estandar:

- Exito: `success: true` + `data` o `message`
- Error: `success: false` + `message` (y `errors` para validacion)

---

## Manejo de errores HTTP

- `400 Bad Request`: body invalido
- `404 Not Found`: cliente no encontrado
- `500 Server Error`: error no controlado (middleware global)

---

## Notas de negocio

Al crear un cliente, el servicio inicializa automaticamente:

- `tipo = "nuevo"`
- `citas_count = 0`
- `servicios_count = 0`
- `status = "activo"`
- `createdAt` y `updatedAt` en formato ISO

En actualizacion, `tipo` se recalcula segun `citas_count`:

- `frecuente` si `citas_count >= 5`
- `nuevo` en otro caso
