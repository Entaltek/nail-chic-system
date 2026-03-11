# Nail Chic System

## 🚀 Setup inicial

### Requisitos
- Node.js 20+ (recomendado usar nvm)
- Firebase CLI: `npm install -g firebase-tools`

### Instalación
```bash
# 1. Clonar el repo
git clone 
cd nail-chic-system

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd functions && npm install && cd ..

# 4. Configurar variables de entorno
cp .env.example .env.development
# Pedir las credenciales de DEV al líder del proyecto y llenar .env.development

# 5. Autenticarse en Firebase
firebase login
firebase use dev

# 6. Correr el proyecto localmente
npm run dev
```

### Comandos disponibles
| Comando | Descripción |
|---|---|
| `npm run dev` | Frontend local en localhost:5173 |
| `npm run deploy:dev` | Deploy a entorno DEV |
| `npm run deploy:prod` | Deploy a entorno PROD (solo líder) |
