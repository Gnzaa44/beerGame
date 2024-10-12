class Game {
    constructor() {
        this.roles = ['Retailer', 'Wholesaler', 'Distributor', 'Factory'];
        this.players = {};
        this.gameState = {
            currentWeek: 0,
            customerDemand: 4,
            roles: {
                Retailer: this.initializeRoleState(),
                Wholesaler: this.initializeRoleState(),
                Distributor: this.initializeRoleState(),
                Factory: this.initializeRoleState()
            },
            
            allOrdersPlaced: false
        };
    }
    initializeRoleState() {
        return {
            playerName: '',
            inventory: 12,
            backorder: 0,
            incomingShipments: [4, 4],
            orderPlaced: false,
            deliveredBeer: 0,
            accumulatedOrders: 0,
            inventoryCost: 0,
            backorderCost: 0,
            totalCosts: 0
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
            return true;
        }
        return false;
    }

    checkAllOrdersPlaced() {
        this.gameState.allOrdersPlaced = Object.values(this.gameState.roles).every(role => role.orderPlaced);
    }

    canAdvanceWeek() {
        return this.gameState.allOrdersPlaced;
    }


    processOrders() {
        for (let i = 0; i < this.roles.length; i++) {
            let role = this.roles[i];
            let roleState = this.gameState.roles[role];
            let nextRole = this.roles[i + 1];

            // Actualizar inventario con pedidos entrantes
            roleState.inventory += roleState.incomingShipments[0] || 0;

            // Calcular demanda
            let demand = (role === 'Retailer') ? this.gameState.customerDemand : 
                        (nextRole ? this.gameState.roles[nextRole].deliveredBeer : 0);

            // Calcular cerveza entregada
            roleState.deliveredBeer = Math.min(roleState.inventory, demand + roleState.accumulatedOrders);

            // Actualizar inventario y pedidos acumulados
            roleState.inventory -= roleState.deliveredBeer;
            roleState.accumulatedOrders = Math.max(0, demand + roleState.accumulatedOrders - roleState.deliveredBeer);

            // Mover los pedidos en la cola
            roleState.incomingShipments.shift();
        }
    }

    calculateCosts() {
        for (let role of this.roles) {
            let roleState = this.gameState.roles[role];
            roleState.inventoryCost += roleState.inventory * 0.5;
            roleState.backorderCost += roleState.accumulatedOrders * 1;
            this.gameState.totalCosts += roleState.inventoryCost + roleState.backorderCost;
        }
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
        if (this.canAdvanceWeek() && this.gameState.currentWeek < this.gameDuration) {
            this.gameState.currentWeek++;
            this.processOrders();
            this.calculateCosts();
            this.resetOrderFlags();
            return true;
        }
        return false;
    }

    
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