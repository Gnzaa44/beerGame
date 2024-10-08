const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../frontendBeerGame')));

let game;

io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado');

  socket.on('getAvailableRoles', () => {
    if (game) {
      socket.emit('availableRoles', game.getAvailableRoles());
    } else {
      socket.emit('availableRoles', ['Retailer', 'Wholesaler', 'Distributor', 'Factory']);
    }
  });

  socket.on('playerInfo', (info) => {
    if (!game) {
      game = new Game(info.gameDuration);
      game.roles.forEach(role => {
        if (role !== info.role) {
          game.addAIPlayer(role);
        }
      });
    }
    const role = game.addPlayer(socket.id, info.name, info.role);
    if (role) {
      socket.emit('roleAssigned', role);
      io.emit('updateGameState', game.getGameState());
      io.emit('availableRoles', game.getAvailableRoles());

    } else {
      socket.emit('roleUnavailable', `El rol ${info.role} seleccionado está en uso. Por favor, elija otro.`);
    }
  });

  socket.on('placeOrder', (order) => {
    const playerRole = game.getPlayerRole(socket.id);
    if (playerRole === order.role) {
      if (game.placeOrder(socket.id, order.amount)) {
        socket.emit('orderConfirmation', `Pedido de ${order.amount} unidades realizado para ${order.role}`);
        if (game.canAdvanceWeek()) {
          advanceWeek();
        } else {
          io.emit('updateGameState', game.getGameState());
        }
      }
    } else {
      socket.emit('orderRejected', `No puedes hacer pedidos para el rol ${order.role}. Tu rol es ${playerRole}.`);
    }
  });

  socket.on('updateInventory', (inventoryUpdate) => {
    const playerRole = game.getPlayerRole(socket.id);
    if (playerRole === inventoryUpdate.role) {
      game.updateInventory(inventoryUpdate.role, inventoryUpdate.inventory);
      io.emit('inventoryUpdated', inventoryUpdate);
    } else {
      socket.emit('inventoryUpdateRejected', `No puedes actualizar el inventario para el rol ${inventoryUpdate.role}. Tu rol es ${playerRole}.`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Jugador desconectado');
    if (game) {
      game.removePlayer(socket.id);
      io.emit('updateGameState', game.getGameState());
      io.emit('availableRoles', game.getAvailableRoles());

    }
  });
});

function advanceWeek() {
  if (game.advanceWeek()) {
    io.emit('weekAdvanced', game.getGameState());
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});