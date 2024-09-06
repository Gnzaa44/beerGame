const socket = io();

let playerName = '';
let playerRole = '';
let currentWeek = 0;

// Mostrar el modal al cargar la página
const playerInfoModal = new bootstrap.Modal(document.getElementById('playerInfoModal'), {
    keyboard: false
});
playerInfoModal.show();

// Manejar el envío del formulario de información del jugador
document.getElementById('startGameBtn').addEventListener('click', () => {
    playerName = document.getElementById('playerName').value.trim();
    playerRole = document.getElementById('playerRole').value;

    if (playerName && playerRole) {
        socket.emit('playerInfo', { name: playerName, role: playerRole });
        playerInfoModal.hide();
    } else {
        alert('Por favor, ingresa tu nombre y elige un rol.');
    }
});

socket.on('roleAssigned', (role) => {
    playerRole = role;
    document.getElementById('player-role').textContent = role;
});

socket.on('updateGameState', (gameState) => {
    currentWeek = gameState.currentWeek;
    document.getElementById('current-week').textContent = currentWeek;
    
    updateRoleInfo(gameState.roles);
    updateInfoPanel(gameState);
});

function updateRoleInfo(roles) {
    for (const [role, info] of Object.entries(roles)) {
        const roleElement = document.getElementById(role.toLowerCase());
        if (roleElement) {
            roleElement.querySelector('.player-name').textContent = info.playerName || 'Esperando jugador';
            roleElement.querySelector('.inventory').textContent = info.inventory;
            roleElement.querySelector('.backorder').textContent = info.backorder;
        }
    }
}

function updateInfoPanel(gameState) {
    document.getElementById('total-costs').textContent = gameState.totalCosts;
    document.getElementById('customer-demand').textContent = gameState.customerDemand;
}

document.querySelectorAll('.order-button').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        const orderAmount = parseInt(input.value);
        if (orderAmount >= 0) {
            socket.emit('placeOrder', { role: playerRole, amount: orderAmount });
            input.value = '';
        }
    });
});

socket.on('orderConfirmation', (message) => {
    alert(message);
});