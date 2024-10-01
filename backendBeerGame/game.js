class Game {
    constructor() {
        this.roles = ['Retailer', 'Wholesaler', 'Distributor', 'Factory'];
        this.players = {};
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
        for (let role of this.roles) {
            let roleState = this.gameState.roles[role];
            let incoming = roleState.incomingShipments[0] || 0;
            roleState.inventory += incoming;
            let demand = (role === 'Retailer') ? this.gameState.customerDemand : (roleState.incomingShipments[1] || 0);
            let shipped = Math.min(roleState.inventory, demand + roleState.backorder);
            roleState.inventory -= shipped;
            roleState.backorder = Math.max(0, roleState.backorder + demand - shipped);
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
        if (this.canAdvanceWeek() && this.gameState.currentWeek < this.gameDuration) {
            this.gameState.currentWeek++;
            this.processOrders();
            this.calculateCosts();
            this.resetOrderFlags();
            return true;
        }
        return false;
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