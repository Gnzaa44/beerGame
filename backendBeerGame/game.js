class Game {
    constructor(gameDuration=24) {
        this.roles = ['Retailer', 'Wholesaler', 'Distributor', 'Factory'];
        this.players = {};
        this.gameDuration=this.gameDuration;
        this.gameState = {
            currentWeek: 0,
            customerDemand: 4,
            roles: {
                Retailer: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4], orderPlaced: false },
                Wholesaler: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4], orderPlaced: false },
                Distributor: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4], orderPlaced: false },
                Factory: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4], orderPlaced: false }
            },
            totalCosts: 0,
            allOrdersPlaced: false
        };
    }

    addPlayer(playerId, playerName, requestedRole) {
        if (this.roles.includes(requestedRole) && !this.gameState.roles[requestedRole].playerName) {
            this.players[playerId] = requestedRole;
            this.gameState.roles[requestedRole].playerName = playerName;
            return requestedRole;
        }
        return null;
    }

    removePlayer(playerId) {
        const role = this.players[playerId];
        if (role) {
            this.gameState.roles[role].playerName = '';
            this.gameState.roles[role].orderPlaced = false;
            delete this.players[playerId];
        }
    }

    placeOrder(playerId, amount) {
        const role = this.players[playerId];
        if (role) {
            this.gameState.roles[role].incomingShipments.push(amount);
            this.gameState.roles[role].orderPlaced = true;
            this.checkAllOrdersPlaced();
            return {
                success: true,
                role: role,
                orderPlaced: this.gameState.roles[role].orderPlaced
            };
        }
        return { success: false };
    }

    checkAllOrdersPlaced() {
        this.gameState.allOrdersPlaced = Object.values(this.gameState.roles).every(role => role.orderPlaced);
    }

    canAdvanceWeek() {
        return this.gameState.allOrdersPlaced;
    }


    processOrders() {
         // Procesar desde el minorista hacia arriba
         for (let i = 0; i < this.roles.length; i++) {
            const role = this.roles[i];
            const roleState = this.gameState.roles[role];
            
            // Recibir envío entrante
            const incoming = roleState.incomingShipments[0] || 0;
            roleState.inventory += incoming;
            
            // Determinar la demanda
            let demand;
            if (role === 'Retailer') {
                demand = this.gameState.customerDemand;
            } else {
                // La demanda viene del pedido del rol anterior
                const previousRole = this.roles[i - 1];
                const previousRoleState = this.gameState.roles[previousRole];
                demand = previousRoleState.incomingShipments[1] || 0;
            }
            
            // Procesar envíos y pedidos pendientes
            const totalDemand = demand + roleState.backorder;
            const shipped = Math.min(roleState.inventory, totalDemand);
            roleState.inventory -= shipped;
            roleState.backorder = Math.max(0, totalDemand - shipped);
            
            // Actualizar cola de envíos
            roleState.incomingShipments.shift();
        }
    }

    calculateCosts() {
        let totalCost = 0;
        for (let role of this.roles) {
            let roleState = this.gameState.roles[role];
            totalCost += roleState.inventory * 0.5;
            totalCost += roleState.backorder * 1;
        }
        this.gameState.totalCosts += totalCost;
    }

    resetOrderFlags() {
        for (let role of this.roles) {
            this.gameState.roles[role].orderPlaced = false;
        }
        this.gameState.allOrdersPlaced = false;
    }

    updateInventory(role, newInventory) {
        if (this.gameState.roles[role]) {
            this.gameState.roles[role].inventory = newInventory;
        }
    }

    getGameState() {
        return this.gameState;
    }
    advanceWeek() {
        if ( this.gameState.currentWeek < this.gameDuration) {
            this.processOrders();
           this.calculateCosts();
           
           // Luego avanzar la semana y resetear flags
           this.gameState.currentWeek++;
           this.resetOrderFlags();
           
           // Actualizar la demanda del cliente (puede ser aleatoria o seguir un patrón)
           this.updateCustomerDemand();
           
           return true;
       }
       return false;
    }
    updateCustomerDemand() {
        // Ejemplo simple: demanda aleatoria entre 0 y 8
        this.gameState.customerDemand = Math.floor(Math.random() * 5) + 2;
    }
  
   isFactoryPlayer(playerId) {
        return this.players[playerId] === 'Factory';
    }

    // Add this new method to check if the game has ended
    isGameOver() {
        return this.gameState.currentWeek >= this.gameDuration;
    }

    getGameState() {
        return {
            ...this.gameState,
            isGameOver: this.isGameOver()
        };
    }
}

module.exports = Game;