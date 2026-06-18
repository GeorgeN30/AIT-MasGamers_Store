# AIT-MasGamers Store — MG Soporte

Aplicación de soporte técnico para la comunidad MasGamers. Sistema completo con backend API, app móvil React Native (Expo) y panel de administración con roles.

---

## Stack

| Capa       | Tecnología                              |
|------------|-----------------------------------------|
| Frontend   | React Native + Expo + React Navigation  |
| Backend    | Express + SQLite (sql.js) + JWT         |
| Sensores   | Cámara, micrófono, GPS (expo-sensors)   |
| Multimedia | expo-image-picker, expo-av              |

---

## Requisitos

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Expo Go (para pruebas físicas)

---

## Instalación y ejecución

```bash
git clone git@github.com:GeorgeN30/AIT-MasGamers_Store.git
cd AIT-MasGamers_Store

# Frontend
npm install
npx expo install @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Backend
cd backend
npm install
node seed.js  # crea DB y datos de prueba
npm start     # servidor en puerto 3000
```

### Iniciar app

```bash
npm start       # Expo dev server
npm run web     # Solo web
npm run android # Emulador Android
```

---

## Scripts

| Comando           | Descripción                         |
|-------------------|-------------------------------------|
| `npm start`       | Servidor de desarrollo Expo         |
| `npm run web`     | Abrir en navegador                  |
| `npm run android` | Abrir en emulador Android           |
| `npm run ios`     | Abrir en simulador iOS              |
| `cd backend && npm start` | Inicia API en puerto 3000    |

---

## Estructura

```
AIT-MasGamers_Store/
├── backend/
│   ├── server.js              # Express app
│   ├── db.js                  # SQLite (sql.js)
│   ├── seed.js                # Datos de prueba
│   ├── uploads/               # Archivos subidos
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── requireRole.js     # Role guard
│   └── routes/
│       ├── auth.routes.js     # Login, register, recovery
│       ├── tickets.routes.js  # CRUD tickets + logs
│       ├── users.routes.js    # Listado usuarios (admin)
│       └── dashboard.routes.js# Stats (admin)
├── src/
│   ├── config.js              # API base URL
│   ├── context/
│   │   └── AuthContext.js     # Sesión global con JWT
│   ├── navigation/
│   │   └── AppNavigator.js    # Bottom tabs + stacks
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── RecoveryScreen.js
│   │   └── dashboard/
│   │       ├── HomeScreen.js
│   │       ├── NewTicketScreen.js   # Cámara, audio, GPS
│   │       ├── HistoryScreen.js     # Lista de tickets
│   │       ├── TicketDetailScreen.js# Detalle + imagen + audio
│   │       ├── MediaScreen.js       # Gestión multimedia
│   │       ├── ProfileScreen.js
│   │       ├── TimelineScreen.js    # Seguimiento visual
│   │       └── admin/
│   │           ├── AdminDashboard.js
│   │           ├── AdminTicketList.js
│   │           └── AdminUsers.js
│   └── services/
│       ├── api.js              # HTTP client con JWT + upload
│       ├── authService.js      # Auth API calls
│       ├── ticketService.js    # Ticket API calls
│       ├── locationService.js  # Geolocalización
│       └── storageService.js   # AsyncStorage / localStorage
```

---

## API Endpoints

| Método | Ruta                    | Auth     | Rol   | Descripción              |
|--------|-------------------------|----------|-------|--------------------------|
| POST   | /api/auth/login         | No       | —     | Iniciar sesión           |
| POST   | /api/auth/register      | No       | —     | Registro                 |
| POST   | /api/auth/security-word | No       | —     | Verificar palabra seg.   |
| POST   | /api/auth/reset-password| No       | —     | Cambiar contraseña       |
| GET    | /api/tickets            | JWT      | —     | Tickets propios (o todos si admin) |
| GET    | /api/tickets/:id        | JWT      | —     | Detalle de ticket        |
| POST   | /api/tickets            | JWT      | —     | Crear ticket             |
| PUT    | /api/tickets/:id/status | JWT      | admin | Cambiar estado           |
| GET    | /api/tickets/:id/logs   | JWT      | —     | Historial de cambios     |
| POST   | /api/upload             | JWT      | —     | Subir imagen/audio       |
| GET    | /api/users              | JWT      | admin | Listar usuarios          |
| GET    | /api/dashboard/stats    | JWT      | admin | Estadísticas             |
| GET    | /api/health             | No       | —     | Health check             |

---

## Roles

### user
- Crear tickets con foto, audio y ubicación GPS
- Ver solo sus propios tickets
- Seguimiento visual por estados

### admin
- Todo lo de user +
- Dashboard con estadísticas
- Lista de todos los tickets con filtros
- Cambiar estado de cualquier ticket
- Gestión de usuarios

---

## Usuarios de prueba (seed)

| Email                  | Contraseña | Rol   |
|------------------------|------------|-------|
| admin@masgamers.com    | admin123   | admin |
| juan@email.com         | 123456     | user  |
| maria@email.com        | 123456     | user  |
| carlos@email.com       | 123456     | user  |

---

## Funcionalidades por pantalla

| Pantalla            | Funcionalidad                                      |
|---------------------|----------------------------------------------------|
| Login/Register      | Auth con JWT, registro con palabra de seguridad    |
| NewTicket           | Seleccionar categoría, foto, grabar audio, GPS     |
| History             | Lista de tickets con iconos de adjuntos            |
| TicketDetail        | Ver imagen, reproducir audio, ubicación en mapa    |
| Timeline            | Seguimiento visual del estado del ticket           |
| Media               | Subir imágenes desde galería                       |
| Profile             | Datos del perfil y cierre de sesión                |
| AdminDashboard      | Stats: total tickets, hoy, usuarios, por estado    |
| AdminTicketList     | Todos los tickets con filtros                      |
| AdminUsers          | Lista de usuarios registrados                      |

---

## Licencia

Proyecto académico — Universidad Tecnológica del Perú (UTP).
