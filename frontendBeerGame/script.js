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

      // Agregar evento de clic al elemento de inventario
      roleElement.querySelector('.inventory').addEventListener('click', () => {
        showInventoryModal(role, info.inventory);
      });
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

// Función para mostrar el modal de inventario
function showInventoryModal(role, inventory) {
  const inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
  const inventoryInput = document.getElementById('inventoryAmount');
  inventoryInput.value = inventory;

  document.getElementById('updateInventoryBtn').addEventListener('click', () => {
    const newInventory = parseInt(inventoryInput.value);
    if (newInventory >= 0) {
      socket.emit('updateInventory', { role, inventory: newInventory });
      inventoryModal.hide();
    } else {
      alert('El inventario no puede ser negativo.');
    }
  });

  inventoryModal.show();
}

socket.on('inventoryUpdated', (updatedInventory) => {
  const roleElement = document.getElementById(updatedInventory.role.toLowerCase());
  roleElement.querySelector('.inventory').textContent = updatedInventory.inventory;
});
socket.on('roleAssigned', (role) => {
  playerRole = role;
  document.getElementById('player-role').textContent = role;
});

socket.on('roleUnavailable', (message) => {
  alert(message);
  playerInfoModal.show();
});