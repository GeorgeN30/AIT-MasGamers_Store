# AIT-MasGamers Store — MG Soporte

Aplicación móvil de soporte técnico para la comunidad MasGamers. Construida con React Native y Expo.

---

## Requisitos previos

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Expo Go en tu dispositivo (para pruebas en móvil)

## Instalación

```bash
# Clonar el repositorio y entrar al directorio
git clone git@github.com:GeorgeN30/AIT-MasGamers_Store.git
cd AIT-MasGamers_Store

# Instalar dependencias
npm install

# Dependencias de navegación (si no están instaladas)
npx expo install @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

## Scripts disponibles

| Comando             | Descripción                              |
|---------------------|------------------------------------------|
| `npm start`         | Inicia el servidor de desarrollo (Expo)  |
| `npm run android`   | Abre en emulador Android                 |
| `npm run ios`       | Abre en simulador iOS                    |
| `npm run web`       | Abre en el navegador (expo web)          |

---

## Estructura del proyecto

```
src/
├── assets/              # Imágenes, logos, iconos
├── components/          # Componentes UI reutilizables
├── context/
│   └── AuthContext.js   # Estado global de sesión (login, logout, registro)
├── database/
│   └── mockUsers.json   # Usuarios de prueba para el entorno mock
├── navigation/
│   └── AppNavigator.js  # Configuración de rutas (AuthStack / MainStack)
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js       # Inicio de sesión (layout adaptativo web/móvil)
│   │   ├── RegisterScreen.js    # Registro con palabra de seguridad
│   │   └── RecoveryScreen.js    # Recuperación de contraseña en 2 pasos
│   └── dashboard/
│       ├── HomeScreen.js        # Pantalla principal tras el login
│       ├── TicketDetailScreen.js
│       └── NewTicketScreen.js
└── services/
    ├── authService.js     # Lógica de autenticación (mock/real intercambiable)
    └── storageService.js  # Almacenamiento persistente (localStorage / AsyncStorage)
```

---

## Autenticación

El módulo de autenticación está diseñado para funcionar inicialmente con datos locales y migrar al backend real sin cambios en el resto del código.

### Modo mock (actual)

Los usuarios se definen en `src/database/mockUsers.json`. Los usuarios registrados desde la app se guardan en `localStorage` (`mg_users`). La sesión activa se persiste en `localStorage` (`mg_session`).

**Usuarios de prueba:**

| Email                  | Contraseña | Rol   |
|------------------------|------------|-------|
| admin@masgamers.com    | admin123   | admin |
| george@gmail.com       | george123  | user  |

### Migración al backend real

En `src/services/authService.js`:

```js
const USE_MOCK = false;
const BASE_URL = 'https://tu-api.com/api';
```

Los endpoints esperados por el servicio son:

| Operación              | Método | Ruta                    |
|------------------------|--------|-------------------------|
| Login                  | POST   | `/auth/login`           |
| Registro               | POST   | `/auth/register`        |
| Verificar seg. word    | POST   | `/auth/verify-security` |
| Cambiar contraseña     | POST   | `/auth/reset-password`  |

### Almacenamiento en móvil (iOS/Android)

Para dispositivos reales, instalar AsyncStorage y descomentar las líneas correspondientes en `src/services/storageService.js`:

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## Recuperación de contraseña

Al no disponer de servidor de correo en la etapa mock, la recuperación usa una **palabra de seguridad** definida en el registro. El flujo es:

1. Usuario ingresa su correo + palabra de seguridad.
2. Si coinciden → puede establecer una nueva contraseña.

---

## Personalización del Login

La pantalla de login en web muestra un panel de imagen a la izquierda. Para cambiar la imagen, editar la constante al inicio de `src/screens/auth/LoginScreen.js`:

```js
const BRAND_IMAGE_URI = 'https://tu-url-de-imagen.com/foto.jpg';
// O una imagen local:
// const BRAND_IMAGE_URI = require('../../assets/mi-imagen.jpg');
```

---

## Tecnologías utilizadas

| Tecnología                | Versión  | Uso                              |
|---------------------------|----------|----------------------------------|
| React Native              | 0.81.5   | Framework base                   |
| Expo                      | ~54.0.33 | Herramientas de desarrollo       |
| @react-navigation/native  | ^7.2.4   | Sistema de navegación            |
| @react-navigation/native-stack | —   | Navegador de pilas               |
| react-native-screens      | —        | Optimización de pantallas        |
| react-native-safe-area-context | — | Áreas seguras del dispositivo    |

---

## Licencia
@GeorgeNs

Proyecto académico — Universidad Tecnológica del Perú (UTP).