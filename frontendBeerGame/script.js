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
});

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
          // Actualización básica
          roleElement.querySelector('.player-name').textContent = info.playerName || 'Esperando jugador';
          roleElement.querySelector('.inventory').textContent = info.inventory;
          roleElement.querySelector('.backorder').textContent = info.backorder;
          roleElement.querySelector('.incoming-orders').textContent = info.incomingShipments.join(', ');

          // Actualización inmediata de costos
          const costsContainer = roleElement.querySelector('.costs-container');
          if (!costsContainer) {
              const newCostsContainer = document.createElement('div');
              newCostsContainer.className = 'costs-container mt-3 alert alert-info';
              newCostsContainer.innerHTML = `
                  <h6 class="alert-heading">Costos Actuales</h6>
                  <div class="cost-item">
                      <small>Inventario (${info.inventory} × $0.50):</small>
                      <span class="inventory-cost">$${info.inventory.toFixed(2)}</span>
                  </div>
                  <div class="cost-item">
                      <small>Backorder (${info.accumulatedOrders} × $1.00):</small>
                      <span class="backorder-cost">$${info.backorderCost.toFixed(2)}</span>
                  </div>
                  <div class="cost-item fw-bold border-top pt-2">
                      <small>Total:</small>
                      <span class="total-cost">$${(info.inventoryCost + info.backorderCost).toFixed(2)}</span>
                  </div>
              `;
              roleElement.insertBefore(newCostsContainer, roleElement.querySelector('.input-group'));
          } else {
              // Actualizar costos existentes con explicación
              const items = costsContainer.querySelectorAll('.cost-item');
              items[0].innerHTML = `<small>Inventario (${info.inventory} × $0.50):</small>
                                  <span class="inventory-cost">$${info.inventoryCost.toFixed(2)}</span>`;
              items[1].innerHTML = `<small>Backorder (${info.accumulatedOrders} × $1.00):</small>
                                  <span class="backorder-cost">$${info.backorderCost.toFixed(2)}</span>`;
              items[2].innerHTML = `<small>Total:</small>
                                  <span class="total-cost">$${(info.inventoryCost + info.backorderCost).toFixed(2)}</span>`;
          }

          // Actualización del estado de la orden
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
  
  // Crear o actualizar el panel de estadísticas globales
  const infoPanel = document.getElementById('info-panel');
  const statsContainer = infoPanel.querySelector('.stats-container') || document.createElement('div');
  statsContainer.className = 'stats-container mt-3';
  
  // Calcular estadísticas globales
  let totalInventoryCost = 0;
  let totalBackorderCost = 0;
  let totalDeliveredBeer = 0;
  
  Object.values(gameState.roles).forEach(role => {
    console.log("en Object.value");
    console.log("role.InvetoryCosts: " + role.inventoryCost);
    totalInventoryCost += role.inventoryCost;
    console.log("totalInvetoryCosts: " + totalInventoryCost);
    totalBackorderCost += role.backorderCost;
    console.log("totalBackorderCosts: " + totalBackorderCost);
    totalDeliveredBeer += role.deliveredBeer;
    console.log("totalDeliveredBeer: " + totalDeliveredBeer);
  });

  statsContainer.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h5>Costos Globales</h5>
        <div>Costo total de inventario: $${totalInventoryCost.toFixed(2)}</div>
        <div>Costo total de backorder: $${totalBackorderCost.toFixed(2)}</div>
        <div>Costo total del juego: $${(totalInventoryCost + totalBackorderCost).toFixed(2)}</div>
      </div>
      <div class="col-md-6">
        <h5>Estadísticas de Entrega</h5>
        <div>Total de cerveza entregada: ${totalDeliveredBeer}</div>
        <div>Semana actual: ${gameState.currentWeek}</div>
      </div>
    </div>
  `;

  if (!infoPanel.querySelector('.stats-container')) {
    infoPanel.appendChild(statsContainer);
  }
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