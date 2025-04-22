import { storage } from './storage.js';

export const brokers = {
    list: [],

    init() {
        this.list = storage.loadData().brokers;
        return this.list;
    },

    add(brokerData) {
        const newBroker = {
            id: 'broker_' + Date.now(),
            name: brokerData.name,
            initialBalance: parseFloat(brokerData.initialBalance),
            currentBalance: parseFloat(brokerData.initialBalance),
            currency: brokerData.currency,
            notes: brokerData.notes,
            createdAt: new Date().toISOString(),
            trades: [],
            strategies: []
        };

        this.list.push(newBroker);
        storage.saveData({ brokers: this.list });
        return newBroker;
    },

    update(brokerId, brokerData) {
        const index = this.list.findIndex(b => b.id === brokerId);
        
        if (index === -1) {
            throw new Error('Corretora não encontrada!');
        }

        const updatedBroker = {
            ...this.list[index],
            ...brokerData,
            updatedAt: new Date().toISOString()
        };

        this.list[index] = updatedBroker;
        storage.saveData({ brokers: this.list });
        return updatedBroker;
    },

    delete(brokerId) {
        const index = this.list.findIndex(b => b.id === brokerId);
        
        if (index === -1) {
            throw new Error('Corretora não encontrada!');
        }

        this.list.splice(index, 1);
        storage.saveData({ brokers: this.list });
    },

    get(brokerId) {
        const broker = this.list.find(b => b.id === brokerId);
        
        if (!broker) {
            throw new Error('Corretora não encontrada!');
        }

        return broker;
    },

    // Atualizar saldo da corretora
    updateBalance(brokerId, amount, type = 'trade') {
        const broker = this.get(brokerId);
        const oldBalance = broker.currentBalance;
        
        if (type === 'trade') {
            broker.currentBalance += amount;
        } else if (type === 'deposit') {
            broker.currentBalance += Math.abs(amount);
        } else if (type === 'withdrawal') {
            broker.currentBalance -= Math.abs(amount);
        }

        broker.balanceHistory = broker.balanceHistory || [];
        broker.balanceHistory.push({
            date: new Date().toISOString(),
            type,
            amount,
            oldBalance,
            newBalance: broker.currentBalance
        });

        this.update(brokerId, broker);
        return broker;
    },

    // Calcular métricas da corretora
    getMetrics(brokerId) {
        const broker = this.get(brokerId);
        const trades = broker.trades || [];
        
        return {
            totalTrades: trades.length,
            winRate: trades.length ? 
                (trades.filter(t => t.result > 0).length / trades.length) * 100 : 0,
            profit: broker.currentBalance - broker.initialBalance,
            profitPercentage: ((broker.currentBalance - broker.initialBalance) / broker.initialBalance) * 100,
            averageTradeResult: trades.length ? 
                trades.reduce((acc, t) => acc + t.result, 0) / trades.length : 0
        };
    }
}; 