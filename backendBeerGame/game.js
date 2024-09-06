class Game {
    constructor() {
        this.roles = ['Retailer', 'Wholesaler', 'Distributor', 'Factory'];
        this.players = {};
        this.gameState = {
            currentWeek: 0,
            customerDemand: 4, // Demanda constante para simplificar
            roles: {
                Retailer: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4] },
                Wholesaler: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4] },
                Distributor: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4] },
                Factory: { playerName: '', inventory: 12, backorder: 0, incomingShipments: [4, 4] }
            },
            totalCosts: 0
        };
    }

    addPlayer(playerId, playerName, requestedRole) {
        if (this.roles.includes(requestedRole) && !this.gameState.roles[requestedRole].playerName) {
            this.players[playerId] = requestedRole;
            this.gameState.roles[requestedRole].playerName = playerName;
            return requestedRole;
        }
        return null; // El rol solicitado no está disponible
    }

    removePlayer(playerId) {
        const role = this.players[playerId];
        if (role) {
            this.gameState.roles[role].playerName = '';
            delete this.players[playerId];
        }
    }

    placeOrder(playerId, amount) {
        const role = this.players[playerId];
        if (role) {
            // Aquí se procesaría el pedido
            console.log(`${role} (${this.gameState.roles[role].playerName}) realizó un pedido de ${amount}`);
        }
    }

    advanceWeek() {
        this.gameState.currentWeek++;
        this.processOrders();
        this.calculateCosts();
    }

    processOrders() {
        // Simplificación del procesamiento de pedidos
        for (let role of this.roles) {
            let roleState = this.gameState.roles[role];
            let incoming = roleState.incomingShipments.shift() || 0;
            roleState.inventory += incoming;
            roleState.inventory = Math.max(0, roleState.inventory - this.gameState.customerDemand);
            roleState.incomingShipments.push(4); // Simplificación: siempre se envían 4 unidades
        }
    }

    calculateCosts() {
        let totalCost = 0;
        for (let role of this.roles) {
            let roleState = this.gameState.roles[role];
            totalCost += roleState.inventory * 0.5; // Costo de inventario
            totalCost += roleState.backorder * 1; // Costo de pedidos pendientes
        }
        this.gameState.totalCosts += totalCost;
    }

    getGameState() {
        return this.gameState;
    }
}

module.exports = Game;