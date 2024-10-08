const socket = io();

let playerName = '';
let playerRole = '';
let currentWeek = 0;
let gameDuration = 24;

const playerInfoModal = new bootstrap.Modal(document.getElementById('playerInfoModal'), {
  keyboard: false
});
const gameSettingsModal = new bootstrap.Modal(document.getElementById('gameSettingsModal'), {
  keyboard: false
});

playerInfoModal.show();

document.getElementById('startGameBtn').addEventListener('click', () => {
  playerName = document.getElementById('playerName').value.trim();
  playerRole = document.getElementById('playerRole').value;

  if (playerName && playerRole) {
    playerInfoModal.hide();
    gameSettingsModal.show();
  } else {
    alert('Por favor, ingresa tu nombre y elige un rol.');
  }
});

document.getElementById('startGameWithSettingsBtn').addEventListener('click', () => {
  gameDuration = parseInt(document.getElementById('gameDuration').value);
  
  if (gameDuration >= 24 && gameDuration <= 50) {
    socket.emit('playerInfo', { name: playerName, role: playerRole, gameDuration: gameDuration });
    gameSettingsModal.hide();
  } else {
    alert('Por favor, selecciona una duración de juego entre 24 y 50 semanas.');
  }
});

socket.on('roleAssigned', (role) => {
  playerRole = role;
  document.getElementById('player-role').textContent = role;
  updateUIForPlayerRole();
});

socket.on('updateGameState', (gameState) => {
  currentWeek = gameState.currentWeek;
  document.getElementById('current-week').textContent = currentWeek;
  
  updateRoleInfo(gameState.roles);
  updateInfoPanel(gameState);
  updateAvailableRoles(gameState.roles);
  if (currentWeek >= gameDuration) {
    endGame(gameState);
  }
});

function updateRoleInfo(roles) {
  for (const [role, info] of Object.entries(roles)) {
    const roleElement = document.getElementById(role.toLowerCase());
    if (roleElement) {
      roleElement.querySelector('.player-name').textContent = info.playerName || 'Esperando jugador';
      roleElement.querySelector('.inventory').textContent = info.inventory;
      roleElement.querySelector('.backorder').textContent = info.backorder;
      roleElement.querySelector('.incoming-orders').textContent = info.incomingShipments.join(', ');

      const orderButton = roleElement.querySelector('.order-button');
      const orderStatus = roleElement.querySelector('.order-status');
      const orderInput = roleElement.querySelector('.order-input');

      if (role === playerRole) {
        if (info.orderPlaced) {
          orderButton.disabled = true;
          orderInput.disabled = true;
          orderStatus.textContent = 'Pedido realizado para esta semana';
          orderStatus.classList.add('text-success');
        } else {
          orderButton.disabled = false;
          orderInput.disabled = false;
          orderStatus.textContent = '';
          orderStatus.classList.remove('text-success');
        }
      } else {
        orderButton.disabled = true;
        orderInput.disabled = true;
        orderStatus.textContent = 'No puedes hacer pedidos para este rol';
        orderStatus.classList.add('text-muted');
      }
      
    }
  }
}

function updateInfoPanel(gameState) {
  document.getElementById('total-costs').textContent = gameState.totalCosts;
  document.getElementById('customer-demand').textContent = gameState.customerDemand;
}
function updateAvailableRoles(roles) {
  const roleSelect = document.getElementById('playerRole');
  roleSelect.innerHTML = '';
  
  for (const [role, info] of Object.entries(roles)) {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    option.disabled = !!info.playerName;
    roleSelect.appendChild(option);
  }
}
function updateUIForPlayerRole() {
  document.querySelectorAll('.role').forEach(roleElement => {
    const role = roleElement.id.charAt(0).toUpperCase() + roleElement.id.slice(1);
    const orderButton = roleElement.querySelector('.order-button');
    const orderInput = roleElement.querySelector('.order-input');
    
    if (role === playerRole) {
      orderButton.disabled = false;
      orderInput.disabled = false;
      orderButton.addEventListener('click', handleOrderPlacement);
    } else {
      orderButton.disabled = true;
      orderInput.disabled = true;
      orderButton.removeEventListener('click', handleOrderPlacement);
    }
  });
}
function handleOrderPlacement(event) {
  const roleElement = event.target.closest('.role');
  const orderInput = roleElement.querySelector('.order-input');
  const orderAmount = parseInt(orderInput.value);
  
  if (orderAmount >= 0) {
    socket.emit('placeOrder', { role: playerRole, amount: orderAmount });
    orderInput.value = '';
  } else {
    alert('Por favor, ingresa una cantidad válida para el pedido.');
  }
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

socket.on('roleUnavailable', (message) => {
  alert(message);
  playerInfoModal.show();
});

socket.on('orderConfirmation', (message) => {
  alert(message);
});

socket.on('weekAdvanced', (gameState) => {
  alert(`¡Todos los pedidos han sido realizados! Avanzando a la semana ${gameState.currentWeek}`);
  updateGameState(gameState);
});

function endGame(gameState) {
  alert(`¡El juego ha terminado! Duración: ${gameDuration} semanas. Costo total: ${gameState.totalCosts}`);
  // Aquí puedes agregar lógica adicional para mostrar resultados finales, reiniciar el juego, etc.
}
socket.emit('getAvailableRoles');

socket.on('availableRoles', (roles) => {
  updateAvailableRoles(roles);
});
socket.on('roleAssigned', (role) => {
  playerRole = role;
  document.getElementById('player-role').textContent = role;
  updateUIForPlayerRole();
});