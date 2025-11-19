# Beer Game - Simulación de Cadena de Suministro

Simulación web interactiva del clásico Beer Game para enseñanza de dinámicas 
de supply chain con comunicación en tiempo real entre múltiples jugadores.

🎮 **Stack:** Node.js, Express.js, Socket.IO, JavaScript (ES6+), Bootstrap

## Arquitectura

**Backend:**
- Servidor Express.js con Socket.IO para WebSockets
- Clase `Game` con lógica de negocio completa
- Gestión de estado compartido entre múltiples clientes

**Frontend:**
- Interfaz responsiva con Bootstrap 5
- Comunicación bidireccional en tiempo real
- Sincronización automática de estado del juego

## Features implementadas

- 🔄 Comunicación en tiempo real (Socket.IO)
- 📊 Gestión de inventarios y pedidos pendientes (backorders)
- 💰 Cálculo dinámico de costos (inventario + pedidos pendientes)
- 📈 Simulación del efecto bullwhip
- 👥 Soporte multi-jugador (4 roles simultáneos)
- ⚙️ Configuración personalizable de duración del juego

## Roles del juego

- **Retailer** (Minorista)
- **Wholesaler** (Mayorista)  
- **Distributor** (Distribuidor)
- **Factory** (Fábrica)

## Lógica de negocio

Cada rol gestiona:
- Inventario actual
- Pedidos pendientes (backorders)
- Envíos entrantes con delay de 2 semanas
- Costos: $0.5 por unidad en inventario + $1 por backorder

## Contexto

Proyecto desarrollado durante pasantía en **Exceser** (Sept-Nov 2024) como 
herramienta educativa para simulación de toma de decisiones en cadenas de 
suministro.


**Nota:** Desarrollado originalmente en Glitch Platform para facilitar 
deployment y colaboración durante el desarrollo.
