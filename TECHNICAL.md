# Documentacion Tecnica - AIT-MasGamers Store

## Arquitectura General

Aplicacion movil full-stack con frontend en React Native (Expo) y backend API en Express.js, conectado al backend de Express para la comunicacion en tiempo real.

```
+-------------------+       HTTP/HTTPS     +-------------------+
|  App React Native | <------------------> |  Backend Express  |
|  (Expo Go / APK)  |                      |  (puerto 3000)    |
+-------------------+                      +--------+----------+
                                                      |
                                           +----------v----------+
                                           |  SQLite (sql.js)     |
                                           |  masgamers.db        |
                                           +---------------------+

Servicios Externos:
  - core.geozns.com: Gateway WebSocket + servicio de OTP por email
```

---

## Stack Tecnologico

### Frontend

| Tecnologia | Version | Proposito |
|---|---|---|
| React Native | 0.81.5 | Framework de interfaz movil |
| Expo SDK | 54 | Plataforma de desarrollo y herramientas |
| React Navigation | 7.x | Navegacion entre pantallas (stack + tabs) |
| AsyncStorage | 2.2.0 | Almacenamiento persistente de sesion |
| expo-av | 16.0.8 | Grabacion y reproduccion de audio |
| expo-file-system | 19.0.23 | Descarga y cache de archivos |
| expo-image-picker | 17.0.11 | Seleccion de imagenes de galeria |
| expo-location | 19.0.8 | Captura de ubicacion GPS |
| expo-sharing | 14.0.8 | Compartir archivos nativo (export PDF) |
| react-native-reanimated | 4.1.1 | Animaciones y gestos |
| react-native-gesture-handler | 2.28.0 | Gestos de deslizar (panel de notificaciones) |
| react-native-screens | 4.16.0 | Contenedores nativos de pantalla |
| react-native-safe-area-context | 5.6.0 | Areas seguras del dispositivo |
| @react-native-vector-icons/ionicons | 13.1.2 | Biblioteca de iconos |
| react-native-worklets | 0.5.1 | Runtime de worklets (dependencia de reanimated) |

### Backend

| Tecnologia | Version | Proposito |
|---|---|---|
| Node.js | 20 | Runtime del servidor |
| Express.js | 4.21.2 | Framework HTTP |
| sql.js | 1.11.0 | SQLite compilado a WASM (base de datos en memoria) |
| bcryptjs | 2.4.3 | Hashing de contrasenas |
| jsonwebtoken | 9.0.2 | Tokens de autenticacion JWT |
| multer | 1.4.5-lts.2 | Manejo de uploads multipart |
| pdfkit | 0.19.1 | Generacion de PDF en el servidor |
| cors | 2.8.5 | Control de acceso cross-origin |
| dotenv | 16.4.7 | Variables de entorno |
| axios | 1.18.1 | Cliente HTTP para APIs externas |
| uuid | 11.1.0 | Generacion de IDs unicos |

### Servicios Externos

| Servicio | URL | Proposito |
|---|---|---|
| Gateway WebSocket | wss://core.geozns.com/v1/ws | Eventos en tiempo real (cambios de estado, mensajes) |
| API de Notificaciones | https://core.geozns.com/v1/notify | Difusion de eventos desde el servidor |
| Servicio OTP Email | https://core.geozns.com/v1/otp/* | Entrega de codigos OTP por email |

### Infraestructura

| Herramienta | Proposito |
|---|---|
| Docker | Contenedorizacion del backend (node:20-alpine) |
| Docker Compose | Orquestacion de servicios con volumenes persistentes |
| EAS Build | Servicio de Expo para generacion de APK |

---

## Estructura del Proyecto

```
AIT-MasGamers_Store/
  backend/
    routes/
      auth.routes.js          # Login, registro, recuperacion OTP, perfil
      tickets.routes.js       # CRUD de tickets, actualizacion de estado, logs
      chat.routes.js          # Mensajes, notificaciones, token WebSocket
      users.routes.js         # Gestion de usuarios (admin)
      dashboard.routes.js     # Estadisticas y reporte PDF
    middleware/
      auth.js                 # Verificacion JWT, verificacion de cuenta activa
      requireRole.js          # Control de acceso por rol
    services/
      pdfService.js           # Generacion de PDF con tablas y tarjetas de resumen
      gatewayService.js       # Cliente del gateway WebSocket externo
      notifyService.js        # Entrega de OTP por email
      imageService.js         # Compresion de imagenes
    db.js                     # Esquema SQLite, migraciones, consultas
    server.js                 # Configuracion de Express, CORS, archivos estaticos
    seed.js                   # Creacion de cuenta admin por defecto
    Dockerfile                # Contenedor de produccion (node:20-alpine)
  frontend/
    src/
      navigation/
        AppNavigator.js       # Enrutamiento Auth stack vs Main stack
      screens/
        auth/
          LoginScreen.js      # Inicio de sesion con email/contrasena
          RegisterScreen.js   # Creacion de cuenta con validaciones
          RecoveryScreen.js   # Recuperacion de contrasena con OTP
        dashboard/
          HomeScreen.js       # Pantalla principal con actividad reciente
          TicketDetailScreen.js  # Vista del ticket, estado, chat
          NewTicketScreen.js  # Creacion de ticket con multimedia
          TimelineScreen.js   # Linea de tiempo visual del progreso
          HistoryScreen.js    # Lista de tickets con busqueda y filtros
          ProfileScreen.js    # Edicion de perfil, avatar, ajustes
          AdminReportScreen.js   # Descarga de reporte PDF
        admin/
          UserManagementScreen.js # CRUD de usuarios (admin)
      context/
        AuthContext.js        # Estado global de autenticacion, eventos WebSocket
      services/
        api.js                # Cliente HTTP con headers de autenticacion automaticos
        authService.js        # Wrapper de API de autenticacion
        ticketService.js      # Wrapper de API de tickets/chat/notificaciones
        userService.js        # Wrapper de API de usuarios (admin)
        storageService.js     # Almacenamiento cross-platform (AsyncStorage/localStorage)
        imageCacheService.js  # Cache de imagenes en disco
        locationService.js    # Helper de ubicacion GPS
      hooks/
        useWebSocket.js       # Conexion WebSocket, reconexion, despacho de eventos
      components/
        NotificationPanel.js  # Panel deslizante de notificaciones
    app.json                  # Configuracion de Expo
    eas.json                  # Perfiles de build de EAS
  docker-compose.yml          # Orquestacion de servicios
```

---

## Endpoints de la API

### Autenticacion (`/api/auth`)

| Metodo | Endpoint | Auth | Descripcion |
|---|---|---|---|
| POST | /register | No | Crear cuenta |
| POST | /login | No | Autenticar y retornar JWT |
| POST | /forgot-password | No | Solicitar OTP por email |
| POST | /verify-otp | No | Verificar OTP y retornar token de reset |
| POST | /reset-password | No | Restablecer contrasena con token |
| POST | /resend-otp | No | Reenviar codigo OTP |
| GET | /me | Si | Obtener perfil del usuario actual |

### Tickets (`/api/tickets`)

| Metodo | Endpoint | Auth | Descripcion |
|---|---|---|---|
| GET | / | Si | Listar tickets (filtrado por rol) |
| GET | /recent-activity | Si | Ultimos 5 logs de cambios de estado |
| GET | /:id | Si | Detalle de un ticket |
| POST | / | Si | Crear ticket con multimedia |
| PUT | /:id/status | Admin | Actualizar estado del ticket |
| GET | /:id/logs | Si | Registro de auditoria del ticket |
| PUT | /:id | Admin | Actualizar campos del ticket |
| POST | /:id/delete | Admin | Eliminacion suave del ticket |

### Chat (`/api/chat`)

| Metodo | Endpoint | Auth | Descripcion |
|---|---|---|---|
| GET | /ws-token | Si | Generar token de autenticacion WebSocket |
| GET | /:ticketId/messages | Si | Obtener mensajes del ticket |
| POST | /:ticketId/messages | Si | Enviar mensaje |
| GET | /notifications | Si | Obtener notificaciones + conteo sin leer |
| PUT | /notifications/:id/read | Si | Marcar notificacion como leida |
| PUT | /notifications/read-all | Si | Marcar todas como leidas |
| DELETE | /notifications/:id | Si | Eliminar notificacion |
| DELETE | /notifications/all | Si | Eliminar todas las notificaciones |

### Usuarios (`/api/users`)

| Metodo | Endpoint | Auth | Descripcion |
|---|---|---|---|
| GET | / | Admin | Listar todos los usuarios |
| PUT | /profile | Si | Actualizar propio perfil |
| PUT | /password | Si | Cambiar propia contrasena |
| PUT | /:id | Admin | Actualizar cualquier usuario |
| POST | /:id/deactivate | Admin | Desactivar usuario |
| PUT | /:id/restore | Admin | Restaurar usuario desactivado |

### Dashboard (`/api/dashboard`)

| Metodo | Endpoint | Auth | Descripcion |
|---|---|---|---|
| GET | /stats | Admin | Estadisticas del dashboard |
| GET | /report | Admin | Descargar reporte PDF |

---

## Esquema de Base de Datos

### users
| Columna | Tipo | Notas |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| name | TEXT NOT NULL | Nombre completo |
| email | TEXT UNIQUE NOT NULL | Correo electronico |
| password | TEXT NOT NULL | Hash bcrypt |
| securityWord | TEXT NOT NULL | Campo legacy de recuperacion |
| role | TEXT DEFAULT 'user' | 'admin' o 'user' |
| avatar | TEXT | URL de imagen |
| active | INTEGER DEFAULT 1 | Flag de eliminacion suave |
| created_at | TEXT | datetime('now') |

### tickets
| Columna | Tipo | Notas |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| userId | TEXT NOT NULL | FK a users |
| equipo | TEXT NOT NULL | Nombre del dispositivo |
| descripcion | TEXT NOT NULL | Descripcion del problema |
| categoria | TEXT NOT NULL | 'Soporte Tecnico' o 'Ventas' |
| estado | TEXT DEFAULT 'Recibido' | Estado actual |
| imageUri | TEXT | Ruta de imagen adjunta |
| audioUri | TEXT | Ruta de audio adjunto |
| latitude | REAL | Latitud GPS |
| longitude | REAL | Longitud GPS |
| created_at | TEXT | datetime('now') |

### logs
| Columna | Tipo | Notas |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| ticketId | TEXT NOT NULL | FK a tickets |
| estado_anterior | TEXT | Estado anterior |
| estado_nuevo | TEXT | Estado nuevo |
| nota | TEXT | Nota opcional del cambio |
| changedBy | TEXT NOT NULL | FK a users |
| changedByName | TEXT | Nombre desnormalizado |
| created_at | TEXT | datetime('now') |

### messages
| Columna | Tipo | Notas |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| ticketId | TEXT NOT NULL | FK a tickets |
| userId | TEXT NOT NULL | FK a users |
| userName | TEXT | Nombre desnormalizado |
| userRole | TEXT | Rol desnormalizado |
| message | TEXT NOT NULL | Contenido del mensaje |
| created_at | TEXT | datetime('now') |

### notifications
| Columna | Tipo | Notas |
|---|---|---|
| id | TEXT PRIMARY KEY | UUID |
| userId | TEXT NOT NULL | FK a users |
| ticketId | TEXT | FK a tickets |
| type | TEXT NOT NULL | 'status_change', 'new_message', 'ticket_created' |
| title | TEXT NOT NULL | Titulo |
| body | TEXT NOT NULL | Cuerpo del mensaje |
| read | INTEGER DEFAULT 0 | Leida o no |
| created_at | TEXT | datetime('now') |

---

## Comunicacion en Tiempo Real

La aplicacion usa WebSocket para actualizaciones en tiempo real:

1. Al iniciar sesion, el frontend solicita un token WebSocket via `GET /api/chat/ws-token`.
2. Se conecta a `wss://core.geozns.com/v1/ws?token=...&app_id=MasGamers-movil`.
3. Eventos recibidos: `STATUS_CHANGE`, `NEW_MESSAGE`, `TICKET_CREATED`.
4. Al recibir un evento, el frontend actualiza el estado local (conteo sin leer, lista de mensajes, estado del ticket).
5. Reconexion automatica al desconectarse (5s para cierre, 10s para error).

---

## Despliegue

### Desarrollo Local

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
```

### Produccion con Docker

```bash
docker compose up -d --build
```

### Variables de Entorno

**Backend** (`backend/.env`):
- `PORT` - Puerto del servidor (default: 3000)
- `JWT_SECRET` - Secreto para firmar JWT
- `JWT_EXPIRES_IN` - Tiempo de vida del token (default: 7d)
- `CORS_ORIGINS` - Origenes permitidos separados por coma (default: *)
- `NOTIFY_API_URL` - URL del servicio de OTP
- `NOTIFY_API_KEY` - Clave API del servicio de OTP

**Frontend** (`frontend/.env`):
- `EXPO_PUBLIC_API_URL` - URL base del backend API

---

## Flujo de Estados del Ticket

```
Recibido -> En diagnostico -> En reparacion -> Esperando repuestos
                                                  |
                                          Reparado -> Enviado al cliente -> Cerrado
```

Cada cambio de estado crea una entrada en la tabla `logs` con notas opcionales, formando un registro de auditoria completo.
