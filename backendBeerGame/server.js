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

  socket.on('playerInfo', (info) => {
    if (!game) {
      game = new Game(info.gameDuration);
    }
    const role = game.addPlayer(socket.id, info.name, info.role);
    if (role) {
      socket.emit('roleAssigned', role);
      io.emit('updateGameState', game.getGameState());
    } else {
      socket.emit('roleUnavailable', `El rol ${info.role} seleccionado está en uso. Por favor, elige otro.`);
    }
  });

  socket.on('placeOrder', (order) => {
    if (game.placeOrder(socket.id, order.amount)) {
      socket.emit('orderConfirmation', `Pedido de ${order.amount} unidades realizado`);
      if (game.canAdvanceWeek()) {
        advanceWeek();
      } else {
        io.emit('updateGameState', game.getGameState());
      }
    }
  });

  socket.on('updateInventory', (inventoryUpdate) => {
    game.updateInventory(inventoryUpdate.role, inventoryUpdate.inventory);
    io.emit('inventoryUpdated', inventoryUpdate);
  });

  socket.on('disconnect', () => {
    console.log('Jugador desconectado');
    if (game) {
      game.removePlayer(socket.id);
      io.emit('updateGameState', game.getGameState());
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