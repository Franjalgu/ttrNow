# ttrNow — Estado del proyecto

> Punto de entrada para retomar. Léelo entero antes de abrir el código. Última actualización: **30 jul 2026**, commit `595b533` (13 commits).

**En una línea:** diario personal privado en una única línea de tiempo, en **un solo archivo HTML** que funciona sin red y sin cuentas, desplegado como PWA instalable.

---

## 1. Qué es

Un diario para recordar la propia vida: desde un hito enorme hasta una tontería. Todo vive en una sola pantalla, una línea de tiempo vertical con los momentos alternando a izquierda y derecha. No es una galería de fotos con notas: es una app de momentos donde la foto es un adjunto pequeño hasta que abres el momento.

Es para una persona. **Sin cuentas, sin login, sin nube, sin analytics, sin onboarding.** Los datos no salen del dispositivo.

### Dónde vive

| Qué | Dónde |
|---|---|
| App en producción | **https://ttrnow.vercel.app** |
| Repo | `github.com/Franjalgu/ttrNow` (público, rama `main`) |
| Proyecto Vercel | `ttrnow`, equipo `languagekingdom` («Fran's projects») |
| Vista previa antigua | Un artifact de claude.ai — **origen distinto, datos distintos**. No escribir ahí. |

**Un diario por dispositivo.** El almacenamiento es por origen: si la mujer del usuario abre la misma URL en su móvil, tiene su propio diario, independiente y no visible para nadie más. Dos personas en el mismo móvil comparten diario.

---

## 2. Lo que está hecho

### Los cinco archivos

- **`ttrNow.html`** (~180 KB, 3.607 líneas) — **la aplicación entera**: HTML, CSS, JS, glifos SVG, semilla. Cero dependencias, cero peticiones a terceros. Abierto suelto desde `file://` funciona y guarda.
- **`sw.js`** — service worker. Solo existe cuando está servido; el HTML suelto lo intenta, no lo encuentra y sigue igual.
- **`manifest.webmanifest`** + **`icon-512.png`**, **`icon-512-maskable.png`**, **`apple-touch-icon.png`** — el HTML se dibuja los suyos en canvas al arrancar, pero si está servido y encuentra estos, los prefiere (iOS no siempre se cree un icono nacido de un `data:` URI).
- **`vercel.json`** — reescribe `/` a `/ttrNow.html` y fuerza revalidación.

### Modelo de datos (IndexedDB, base `ttrnow`)

Almacenes: `moments`, `people`, `places`, `things`, `media`, `meta`.

Un **momento** es autocontenido: `id` (uuid), `datetime` ISO, `end` (solo viajes), `type`, `preset`, `thingId`, `title`, `note`, `tags[]`, `peopleIds[]`, `placeId`, `photos[]`, `audio[]`, `fields{}`, `createdAt`, `updatedAt`.

**Tipos:** `momento` · `hito` · `viaje` · `ficha` · `efemeride`.

- **hito** — pesa más: Didot más grande, borde y nodo en latón.
- **viaje** — no es un punto sino un tramo: tiene `end` y pinta una **franja cálida** por detrás de todas las filas que caen dentro.
- **ficha** — 12 presets (vino, sitio, libro, comida, gimnasio, deporte, concierto, película, receta, ruta, compra, salud). Dos fichas con el mismo título enlazan al mismo `Thing`: «es la 3ª vez con esto».
- **efeméride** — se repite cada año, en tono tenue, y **solo en las vueltas ya cumplidas**: el diario no se adelanta.

**Media:** las fotos se comprimen en canvas a 1600 px (calidad 0,82) más miniatura de 400 px, que es la que pinta la línea. El original no se guarda: ya vive en el carrete. Audio mono con `MediaRecorder`. Nunca `localStorage` para media.

### Funciones

**Línea de tiempo** — scroll incremental (36 filas por tanda) con `content-visibility`, `IntersectionObserver` para miniaturas y liberación de `object-url` al salir de pantalla. Medido: **61 fps con 2.000 momentos**, peor fotograma 17 ms.

**Estaciones** — la estación es sobre todo *cantidad de luz*, interpolada en continuo según la fecha que estás mirando: invierno `#04070c` cerrado y lunar, verano `#1c1911` abierto y dorado. Partículas en canvas (copos con halo, pétalos, motas, hojas que rotan), pausadas si la pestaña no se ve.

**El año** en Didot, gigante, detrás de las tarjetas, rodando dígito a dígito. Es el elemento memorable.

**Muesca al desplazar** — `scroll-snap` de proximidad más un destello cuando un momento cruza la línea de lectura (45 % de la pantalla), con vibración donde el navegador la ofrece. En iOS no hay API de vibración: allí la sensación es el enganche y el destello.

**Buscador único** — entiende fechas en español (`verano 2024`, `hace 2 años`, `29 jul 2026`, `3/5/2020`, `navidad`, `reyes`, `san juan 2019`…) y salta ahí; si no es fecha, filtra la propia línea y la comprime, con tolerancia a erratas y acentos. Sugerencias agrupadas por fechas / personas / lugares / etiquetas / fichas / momentos.

**Captura** — botón `+`: toque para un momento en blanco, mantener pulsado para ir a fotos. EXIF (JPEG **y HEIC**) para proponer la fecha. Grabadora de voz con punto rojo, tiempo corriendo, **onda dibujada desde el micrófono** y dos acciones separadas: Parar y Descartar.

**Importar el carrete** — una tanda de fotos se convierte en momentos ya colocados en su fecha, agrupando por cercanía **solo cuando la fecha viene del EXIF**. Si no la hay, cada foto va suelta.

**Arreglos posteriores** — «Separar fotos» (deshace un agrupado que no era) y «poner fechas» (pantalla con miniatura y selector para toda una tanda que comparte fecha).

**Respaldo** — `.zip` abierto y documentado dentro del propio `data.json`, escrito y leído sin dependencias, **válido para `unzip`**. Compartir por la hoja del sistema o descargar. Aviso a los 30 días con el contador sin respaldar.

**Bloqueo** — Face ID por WebAuthn con PIN obligatorio de respaldo. Mientras está cerrado no se carga ni un dato.

**Otros** — deshacer al borrar (7 s, y la media no se toca hasta que expira), gestor de personas/lugares/etiquetas con renombrar-que-fusiona, `prefers-reduced-motion`, roles ARIA, foco visible, todo en español.

---

## 3. Decisiones grandes cerradas

- **Un solo archivo.** No hay build ni dependencias. Si algo obliga a partirlo, es que la decisión ha cambiado: hablarlo antes.
- **Arriba lo reciente, abajo el pasado.** Escribir es siempre «arriba»; bajar es recordar.
- **El día manda sobre la hora.** Junto al nodo va el número del día grande y el día de la semana; la hora acompaña. El mes y el año ya están siempre a la vista arriba.
- **Un service worker no se registra desde un blob** — ningún navegador lo permite. Por eso hay `sw.js` de verdad, y por eso el archivo suelto no tiene caché propia (funciona igual, no es offline-para-siempre).
- **El bloqueo es una puerta, no una caja fuerte.** Los datos siguen sin cifrar en IndexedDB. Tapa que alguien coja el móvil desbloqueado; no protege contra un análisis forense.
- **Nada de Google Drive directo.** Exige proyecto en Google Cloud, ata la app a un origen registrado (el archivo suelto dejaría de funcionar) y **aun así no sería automático**, porque iOS no permite trabajo en segundo plano. La hoja de compartir da el 90 % por el 5 % del coste.
- **La miniatura flota y el texto la rodea.** En flex se comía un cuarto del ancho de la tarjeta.
- **La tarjeta de hito no se ensancha**: cruzaba la línea central y tapaba la hora. Se probó y se revirtió.
- **Sin gesto de arrastrar para cerrar.** En una tarjeta larga, bajar el dedo para llegar a los botones contaba como el gesto y cerraba el momento. Para cerrar está la X.

---

## 4. Cómo retomar

```bash
cd ~/dev/ttrNow
git log --oneline -5          # dónde quedó
git status --short            # ¿algo sin commitear?

# Servir en local (solo 127.0.0.1: el directorio contiene .env.local con
# el token de Vercel, y python http.server lo sirve todo)
python3 -m http.server 8791 --bind 127.0.0.1
# → http://127.0.0.1:8791/ttrNow.html

# Desplegar (GitHub y Vercel NO están vinculados todavía: un push no despliega)
~/.npm/_npx/69f9afb961c37556/node_modules/.bin/vercel deploy --prod
git push origin main
```

### Cómo se prueba esto

No hay framework de tests. Se verifica **conduciendo Chrome headless por CDP** con scripts de Node de usar y tirar (`/tmp/*.mjs`): se lanza Chrome con `--remote-debugging-port=9333`, se abre un WebSocket contra el target y se ejecuta JS en la página, capturando `Runtime.exceptionThrown`. Sirve para medir fps, auditar IndexedDB, simular toques y sacar capturas a 430×932.

**Lo que este método NO cubre:** WebKit. Varios fallos reales solo aparecieron en el iPhone (el teclado tapando el campo, el gesto que cerraba la tarjeta). Safari puede automatizarse igual, pero **exige activar a mano** Safari → Ajustes → Avanzado → Mostrar menú Desarrollo → Desarrollo → **Permitir automatización remota**. Si se activa, se puede probar WebKit desde aquí.

---

## 5. Siguiente acción concreta

**Quitar la semilla de ejemplo.** Es lo único pendiente que está acordado y sin hacer.

Los ~20 momentos de ejemplo están escritos a pelo en el array `SEED` de `ttrNow.html` y contienen contenido que **parece vida real del usuario**: «Nació Emma», «Murió el abuelo Ramón», «Hospital de La Paz», y los nombres Marta, Nico, papá. Es todo inventado, pero está publicado bajo su nombre real en un repo público y en una URL abierta, y un desconocido no tiene forma de saber que es ficción.

Se vuelve urgente en cuanto se comparta la app con alguien más: **el móvil de esa persona arrancaría limpio y vería esa vida inventada.**

Cómo: vaciar el array `SEED` (o dejar ejemplos neutros, sin nombres ni nacimientos ni muertes) y redesplegar. Los diarios ya sembrados no se ven afectados: la clave `seeded` de `meta` impide volver a sembrar.

Sin decidir todavía: **poner el repo en privado**.

---

## 6. Lo que NO hay que tocar

- **La compresión de fotos.** 1600 px / 0,82 con miniatura de 400 está medido y equilibrado.
- **El formato del zip.** Es un contrato: hay respaldos ahí fuera. Se puede añadir, no cambiar lo que ya existe.
- **`content-visibility` en `.row`.** Da el rendimiento, pero **hace mentir a `offsetTop`** en filas sin pintar. Todo lo que lea posiciones (saltar a una fecha, colocar la franja de un viaje) corrige en pasadas y no cachea alturas. Ha mordido dos veces.
- **La semilla dinámica.** Un momento cae en el mismo día de hoy de hace 3 años para que «hoy hace X años» no nazca vacío.

---

## 7. Pendientes y deuda

**Sin verificar en un iPhone de verdad** (no reproducibles desde aquí):

- La **hoja de compartir** del respaldo.
- **Face ID** (WebAuthn). El PIN sí está probado.
- El arreglo del **teclado** (`visualViewport`) al añadir personas.

**Limitaciones asumidas, no bugs:**

- **Nada en segundo plano en iOS**: ni respaldo automático, ni notificaciones, ni recordatorios.
- **No se puede compartir una foto *hacia* ttrNow** desde Fotos: el Share Target no existe en iOS.
- **`navigator.storage.persist()` no se concede** siempre (Safari no lo implementa). De ahí que el aviso de respaldo importe.
- Los datos **no están cifrados**. Cifrarlos de verdad rompería la búsqueda y el rendimiento; sería otra obra.
- El **`.zip` del respaldo lleva el diario entero en claro**: no dejarlo en carpetas sincronizadas.

**Deuda menor:**

- GitHub y Vercel **sin vincular**: cada despliegue es manual por CLI.
- La CLI de Vercel no está instalada globalmente; se usa la copia de la caché de `npx` (la ruta está en §4). Si esa caché se limpia, `npx vercel` la vuelve a bajar.
- `.env.local` (token OIDC de Vercel) está en el directorio e ignorado por git. **No servir el directorio en la red local**: `python3 -m http.server` sirve también los ocultos.
- El aviso «Se ha roto algo» al usuario es un chivato puesto para depurar en remoto. Si deja de hacer falta, se quita.

---

## 8. Si vuelves después de mucho tiempo

1. `git log --oneline -20` — dónde quedó el progreso real.
2. Leer este archivo entero.
3. Abrir https://ttrnow.vercel.app en el móvil y usarlo cinco minutos: **casi todos los fallos de este proyecto han aparecido usándolo con el dedo, no leyendo el código.**
4. Comprobar que sigue el pendiente de la §5 antes de compartir la app con nadie.
5. Las memorias del proyecto se cargan solas en Claude.
