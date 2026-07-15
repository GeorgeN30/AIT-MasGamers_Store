# AIT-MasGamers Store - Sistema de Gestion de Tickets de Soporte

Aplicacion movil para la gestion de tickets de soporte de la tienda MasGamers. Los clientes pueden crear tickets de soporte con archivos multimedia, rastrear su estado en tiempo real y comunicarse directamente con el personal de soporte a traves de un chat integrado.

## Tabla de Contenidos

- [Primeros Pasos](#primeros-pasos)
- [Registro de Usuario](#registro-de-usuario)
- [Inicio de Sesion](#inicio-de-sesion)
- [Recuperacion de Contrasena](#recuperacion-de-contrasena)
- [Creacion de Tickets](#creacion-de-tickets)
- [Detalle del Ticket](#detalle-del-ticket)
- [Chat de Comunicacion](#chat-de-comunicacion)
- [Seguimiento del Estado](#seguimiento-del-estado)
- [Historial de Tickets](#historial-de-tickets)
- [Gestion del Perfil](#gestion-del-perfil)
- [Funciones de Administrador](#funciones-de-administrador)
- [Notificaciones](#notificaciones)

---

## Primeros Pasos

1. Descarga e instala el APK en tu dispositivo Android.
2. Abre la aplicacion. Veras la pantalla de inicio de sesion.
3. Si no tienes cuenta, toca "No tienes cuenta? Registrate" para crear una.

## Registro de Usuario

1. En la pantalla de inicio de sesion, toca **"No tienes cuenta? Registrate"**.
2. Completa los campos obligatorios:
   - **Nombre completo**: Tu nombre completo.
   - **Correo electronico**: Una direccion de correo valida (debe contener @ y un dominio).
   - **Contrasena**: Debe cumplir con los siguientes requisitos:
     - Minimo 6 caracteres
     - Al menos una letra mayuscula (A-Z)
     - Al menos un numero (0-9)
     - Al menos un caracter especial (!@#$%&*+? etc.)
3. Toca **"Registrarse"**.
4. Seras redirigido a la pantalla de inicio de sesion con un mensaje de exito.

## Inicio de Sesion

1. Ingresa tu **correo electronico** y **contrasena**.
2. Toca **"Iniciar sesion"**.
3. Al iniciar correctamente, accederas a la pantalla principal.

## Recuperacion de Contrasena

1. En la pantalla de inicio de sesion, toca **"Olvidaste tu contrasena?"**.
2. Ingresa tu correo electronico registrado y toca **"Enviar codigo"**.
3. Revisa tu correo para obtener un codigo OTP de 6 digitos.
4. Ingresa el codigo en la pantalla de verificacion.
5. Toca **"Verificar"**.
6. Ingresa tu nueva contrasena (mismos requisitos que el registro).
7. Toca **"Restablecer contrasena"**.
8. Seras redirigido a la pantalla de inicio de sesion.

Nota: El codigo OTP expira en unos minutos. Puedes solicitar uno nuevo despues de 60 segundos.

## Creacion de Tickets

1. Desde la pantalla principal, toca **"Nuevo ticket"**.
2. Completa los campos obligatorios:
   - **Equipo**: Nombre del dispositivo o equipo (ej: "Laptop HP Pavilion").
   - **Descripcion**: Describe el problema en detalle.
   - **Categoria**: Selecciona "Soporte Tecnico" o "Ventas".
3. Opcionalmente adjunta:
   - **Imagen**: Toca el boton de imagen para seleccionar una foto de tu galeria.
   - **Audio**: Toca el boton de microfono para grabar una nota de voz.
   - **Ubicacion**: Toca el boton de ubicacion para adjuntar tus coordenadas GPS.
4. Toca **"Enviar ticket"**.
5. El ticket se crea con estado "Recibido" y el personal de soporte es notificado.

## Detalle del Ticket

1. Desde la pestana **Historial**, toca cualquier ticket para ver sus detalles.
2. Veras:
   - Nombre del equipo y descripcion
   - Estado actual con un indicador visual
   - Imagen adjunta (si existe)
   - Boton de reproduccion de audio (si se adjunto una nota de voz)
   - Enlace de ubicacion GPS (si se adjunto, se abre en Google Maps)
   - Historial de cambios de estado (registro de auditoria)
   - Seccion de chat para mensajeria con soporte

## Chat de Comunicacion

Cada ticket tiene una seccion de chat integrada en la parte inferior de la pantalla de detalles.

1. Desplazate hacia abajo hasta la seccion **"Chat del ticket"**.
2. Escribe tu mensaje en el campo de texto.
3. Toca **"Enviar"** o presiona Enter.
4. Tus mensajes aparecen en el lado derecho (fondo oscuro).
5. Los mensajes del personal de soporte aparecen en el lado izquierdo (fondo claro).
6. Los mensajes se actualizan en tiempo real via WebSocket.

Nota: No puedes enviar mensajes en tickets cerrados.

## Seguimiento del Estado

Cada ticket sigue un flujo de 7 pasos:

1. **Recibido** - Ticket recibido
2. **En diagnostico** - Siendo diagnosticado
3. **En reparacion** - En proceso de reparacion
4. **Esperando repuestos** - Esperando piezas
5. **Reparado** - Reparado
6. **Enviado al cliente** - Enviado al cliente
7. **Cerrado** - Cerrado

Puedes ver el estado actual y el progreso en la pestana **Seguimiento**, que muestra una linea de tiempo visual para cada ticket.

## Historial de Tickets

1. Toca la pestana **Historial** en la navegacion inferior.
2. Usa la barra de busqueda para filtrar tickets por palabra clave.
3. Usa los filtros desplegables para filtrar por **estado** o **categoria**.
4. Toca cualquier ticket para ver todos sus detalles.

## Gestion del Perfil

1. Toca la pestana **Perfil** en la navegacion inferior.
2. Desde aqui puedes:
   - Ver y editar tu **nombre**.
   - Cambiar tu **avatar** (toca el avatar para seleccionar una nueva imagen).
   - Cambiar tu **contrasena** (ingresa la contrasena actual y la nueva).
   - Activar/desactivar **notificaciones**.
   - **Cerrar sesion**.

## Funciones de Administrador

Los administradores tienen capacidades adicionales:

### Gestion de Tickets
- Cambiar el estado del ticket con notas opcionales
- Editar detalles del ticket (equipo, descripcion)
- Eliminar tickets

### Gestion de Usuarios
1. Accede desde la pestana **Perfil** (seccion de administrador).
2. Ve todos los usuarios registrados.
3. Cambia roles de usuario (administrador/usuario).
4. Desactiva o restaura cuentas de usuario.
5. Edita nombre y correo de usuarios.

### Reportes PDF
1. Accede desde la pestana **Perfil** (seccion de administrador).
2. Toca **"Descargar reporte"** para generar un PDF.
3. El reporte incluye resumenes de tickets, desglose por estado y graficos.
4. Comparte el PDF via el menu de compartir de tu dispositivo.

## Notificaciones

- El icono de campana en la esquina superior derecha muestra el conteo de notificaciones sin leer.
- Toca la campana para abrir el panel de notificaciones.
- Las notificaciones incluyen: nuevos tickets, cambios de estado y nuevos mensajes.
- Desliza hacia la derecha o toca fuera para cerrar el panel.
- Marca notificaciones individuales como leidas, o marca todas como leidas.
- Elimina notificaciones individuales o borra todas.
