import { storage } from './storage.js';
import { brokers } from './brokers.js';

export const strategies = {
    list: [],

    init() {
        this.list = storage.loadData().strategies;
        return this.list;
    },

    add(strategyData) {
        const broker = brokers.get(strategyData.brokerId);
        
        const newStrategy = {
            id: 'strategy_' + Date.now(),
            name: strategyData.name,
            brokerId: strategyData.brokerId,
            type: strategyData.type,
            config: strategyData.config || {},
            description: strategyData.description,
            rules: strategyData.rules || [],
            createdAt: new Date().toISOString(),
            trades: [],
            active: true
        };

        this.list.push(newStrategy);
        broker.strategies.push(newStrategy.id);
        
        storage.saveData({ 
            strategies: this.list,
            brokers: brokers.list
        });
        
        return newStrategy;
    },

    update(strategyId, strategyData) {
        const index = this.list.findIndex(s => s.id === strategyId);
        
        if (index === -1) {
            throw new Error('Estratégia não encontrada!');
        }

        const updatedStrategy = {
            ...this.list[index],
            ...strategyData,
            updatedAt: new Date().toISOString()
        };

        this.list[index] = updatedStrategy;
        storage.saveData({ strategies: this.list });
        return updatedStrategy;
    },

    delete(strategyId) {
        const strategy = this.get(strategyId);
        const broker = brokers.get(strategy.brokerId);
        
        // Remover estratégia da lista de estratégias da corretora
        const strategyIndex = broker.strategies.indexOf(strategyId);
        if (strategyIndex > -1) {
            broker.strategies.splice(strategyIndex, 1);
        }

        // Remover estratégia da lista principal
        const index = this.list.findIndex(s => s.id === strategyId);
        if (index > -1) {
            this.list.splice(index, 1);
        }

        storage.saveData({ 
            strategies: this.list,
            brokers: brokers.list
        });
    },

    get(strategyId) {
        const strategy = this.list.find(s => s.id === strategyId);
        
        if (!strategy) {
            throw new Error('Estratégia não encontrada!');
        }

        return strategy;
    },

    // Obter estratégias de uma corretora
    getByBroker(brokerId) {
        return this.list.filter(s => s.brokerId === brokerId);
    },

    // Ativar/desativar estratégia
    toggleActive(strategyId) {
        const strategy = this.get(strategyId);
        strategy.active = !strategy.active;
        this.update(strategyId, strategy);
        return strategy;
    },

    // Calcular métricas da estratégia
    getMetrics(strategyId) {
        const strategy = this.get(strategyId);
        const trades = strategy.trades || [];
        
        return {
            totalTrades: trades.length,
            winRate: trades.length ? 
                (trades.filter(t => t.result > 0).length / trades.length) * 100 : 0,
            profit: trades.reduce((acc, t) => acc + t.result, 0),
            averageTradeResult: trades.length ? 
                trades.reduce((acc, t) => acc + t.result, 0) / trades.length : 0,
            consecutiveWins: this.getConsecutiveResults(trades, true),
            consecutiveLosses: this.getConsecutiveResults(trades, false)
        };
    },

    // Auxiliar para calcular sequências consecutivas
    getConsecutiveResults(trades, isWin) {
        let max = 0;
        let current = 0;
        
        trades.forEach(trade => {
            if ((trade.result > 0) === isWin) {
                current++;
                max = Math.max(max, current);
            } else {
                current = 0;
            }
        });
        
        return max;
    }
}; 