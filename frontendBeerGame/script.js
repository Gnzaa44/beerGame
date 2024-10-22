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
  updateInputs(role);
  // Mostrar el botón "Avanzar Semana" solo si el rol es Factory
});



function updateInputs(role) {
  const inputs = document.querySelectorAll('.order-input');
  const buttons = document.querySelectorAll('.order-button');
  
  inputs.forEach(input => {
    if (input.classList.contains(`${role.toLowerCase()}-input`)) {
      input.disabled = false;
      input.classList.add('active-input');
    } else {
      input.disabled = true;
      input.classList.remove('active-input');
    }
  });
}


socket.on('updateGameState', (gameState) => {
  currentWeek = gameState.currentWeek;
  
  document.getElementById('current-week').textContent = currentWeek;
  
  updateRoleInfo(gameState.roles);
  updateInfoPanel(gameState);
  
  if (currentWeek >= gameDuration) {
    endGame(gameState);
  }
});

function updateRoleInfo(roles) {
  for (const [role, info] of Object.entries(roles)) {
      const roleElement = document.getElementById(role.toLowerCase());
      if (roleElement) {
          // Actualización básica de información
          roleElement.querySelector('.player-name').textContent = info.playerName || 'Esperando jugador';
          roleElement.querySelector('.inventory').textContent = info.inventory;
          roleElement.querySelector('.backorder').textContent = info.accumulatedOrders;
          roleElement.querySelector('.incoming-orders').textContent = info.incomingShipments.join(', ');

          // Crear o actualizar el contenedor de costos
          let costsContainer = roleElement.querySelector('.costs-container');
          if (!costsContainer) {
              costsContainer = document.createElement('div');
              costsContainer.className = 'costs-container mt-3';
              roleElement.appendChild(costsContainer);
          }

          // Actualizar los costos con detalles
          costsContainer.innerHTML = `
              <div class="card">
                  <div class="card-header bg-info text-white">
                      <h6 class="mb-0">Costos de ${role}</h6>
                  </div>
                  <div class="card-body">
                      <h6>Costos Semanales</h6>
                      <div class="ml-3 mb-2">
                          <div>Inventario (${info.inventory} × $0.50) = $${info.inventoryCost?.toFixed(2) || '0.00'}</div>
                          <div>Backorder (${info.accumulatedOrders} × $1.00) = $${info.backorderCost?.toFixed(2) || '0.00'}</div>
                          <div class="font-weight-bold">Total Semanal: $${info.weeklyTotalCost?.toFixed(2) || '0.00'}</div>
                      </div>
                      
                      <h6 class="mt-3">Costos Acumulados</h6>
                      <div class="ml-3">
                          <div>Total Inventario: $${info.totalInventoryCost?.toFixed(2) || '0.00'}</div>
                          <div>Total Backorder: $${info.totalBackorderCost?.toFixed(2) || '0.00'}</div>
                          <div class="font-weight-bold">Total Acumulado: $${info.totalCost?.toFixed(2) || '0.00'}</div>
                      </div>
                  </div>
              </div>
          `;

          // Actualizar estado del botón de orden
          const orderButton = roleElement.querySelector('.order-button');
          const orderStatus = roleElement.querySelector('.order-status');
          if (info.orderPlaced) {
              orderButton.disabled = true;
              orderStatus.textContent = 'Pedido realizado para esta semana';
              orderStatus.classList.add('text-success');
          } else {
              orderButton.disabled = false;
              orderStatus.textContent = '';
              orderStatus.classList.remove('text-success');
          }
      }
  }
}

function updateInfoPanel(gameState) {
  document.getElementById('customer-demand').textContent = gameState.customerDemand;
  
  const totalCosts = Object.values(gameState.roles).reduce((sum, role) => 
      sum + (role.totalCost || 0), 0);
  
  const infoPanel = document.getElementById('info-panel');
  infoPanel.innerHTML = `
      <div class="card mt-3">
          <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Resumen del Juego</h5>
          </div>
          <div class="card-body">
              <div class="row">
                  <div class="col-md-6">
                      <h6>Semana Actual: ${gameState.currentWeek}</h6>
                      <h6>Demanda del Cliente: ${gameState.customerDemand}</h6>
                  </div>
                  <div class="col-md-6">
                      <h6>Costo Total del Juego: $${totalCosts.toFixed(2)}</h6>
                  </div>
              </div>
          </div>
      </div>
  `;
}
/*function updateRoleInfo(roles) {
  for (const [role, info] of Object.entries(roles)) {
    const roleElement = document.getElementById(role.toLowerCase());
    if (roleElement) {
      roleElement.querySelector('.player-name').textContent = info.playerName || 'Esperando jugador';
      roleElement.querySelector('.inventory').textContent = info.inventory;
      roleElement.querySelector('.backorder').textContent = info.backorder;
      roleElement.querySelector('.incoming-orders').textContent = info.incomingShipments.join(', ');

      const orderButton = roleElement.querySelector('.order-button');
      const orderStatus = roleElement.querySelector('.order-status');

      if (info.orderPlaced) {
        orderButton.disabled = true;
        orderStatus.textContent = 'Pedido realizado para esta semana';
        orderStatus.classList.add('text-success');
      } else {
        orderButton.disabled = false;
        orderStatus.textContent = '';
        orderStatus.classList.remove('text-success');
      }

      roleElement.querySelector('.inventory').addEventListener('click', () => {
        showInventoryModal(role, info.inventory);
      });
    }
  }
}

function updateInfoPanel(gameState) {
  //document.getElementById('total-costs').textContent = gameState.totalCosts;
  document.getElementById('customer-demand').textContent = gameState.customerDemand;
}*/

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