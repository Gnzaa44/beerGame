const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../frontendBeerGame')));

const game = new Game();

io.on('connection', (socket) => {
    console.log('Nuevo jugador conectado');

    socket.on('playerInfo', (info) => {
        const role = game.addPlayer(socket.id, info.name, info.role);
        if (role) {
            socket.emit('roleAssigned', role);
            io.emit('updateGameState', game.getGameState());
        } else {
            socket.emit('roleUnavailable', 'El rol seleccionado no está disponible. Por favor, elige otro.');
        }
    });

    socket.on('placeOrder', (order) => {
        game.placeOrder(socket.id, order.amount);
        socket.emit('orderConfirmation', `Pedido de ${order.amount} unidades realizado`);
        io.emit('updateGameState', game.getGameState());
    });

    socket.on('disconnect', () => {
        console.log('Jugador desconectado');
        game.removePlayer(socket.id);
        io.emit('updateGameState', game.getGameState());
    });
});

function startGame() {
    setInterval(() => {
        game.advanceWeek();
        io.emit('updateGameState', game.getGameState());
    }, 10000); // Avanza una semana cada 10 segundos
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    startGame();
});