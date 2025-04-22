import { storage } from './storage.js';
import { brokers } from './brokers.js';
import { strategies } from './strategies.js';

export const trades = {
    list: [],

    init() {
        this.list = storage.loadData().trades;
        return this.list;
    },

    add(tradeData) {
        const broker = brokers.get(tradeData.brokerId);
        const strategy = strategies.get(tradeData.strategyId);
        
        const newTrade = {
            id: 'trade_' + Date.now(),
            brokerId: tradeData.brokerId,
            strategyId: tradeData.strategyId,
            type: tradeData.type, // 'CALL' ou 'PUT'
            amount: parseFloat(tradeData.amount),
            result: parseFloat(tradeData.result),
            entryPrice: parseFloat(tradeData.entryPrice),
            exitPrice: parseFloat(tradeData.exitPrice),
            timeframe: tradeData.timeframe,
            asset: tradeData.asset,
            notes: tradeData.notes,
            createdAt: new Date().toISOString()
        };

        // Adicionar trade à lista principal
        this.list.push(newTrade);

        // Adicionar trade à corretora
        broker.trades.push(newTrade.id);
        brokers.updateBalance(broker.id, newTrade.result);

        // Adicionar trade à estratégia
        strategy.trades.push(newTrade.id);

        storage.saveData({ 
            trades: this.list,
            brokers: brokers.list,
            strategies: strategies.list
        });

        return newTrade;
    },

    update(tradeId, tradeData) {
        const trade = this.get(tradeId);
        const oldResult = trade.result;
        
        const updatedTrade = {
            ...trade,
            ...tradeData,
            updatedAt: new Date().toISOString()
        };

        // Se o resultado foi alterado, atualizar saldo da corretora
        if (oldResult !== updatedTrade.result) {
            const difference = updatedTrade.result - oldResult;
            brokers.updateBalance(trade.brokerId, difference);
        }

        const index = this.list.findIndex(t => t.id === tradeId);
        this.list[index] = updatedTrade;

        storage.saveData({ 
            trades: this.list,
            brokers: brokers.list
        });

        return updatedTrade;
    },

    delete(tradeId) {
        const trade = this.get(tradeId);
        
        // Remover trade da corretora e atualizar saldo
        const broker = brokers.get(trade.brokerId);
        const tradeIndexBroker = broker.trades.indexOf(tradeId);
        if (tradeIndexBroker > -1) {
            broker.trades.splice(tradeIndexBroker, 1);
            brokers.updateBalance(broker.id, -trade.result);
        }

        // Remover trade da estratégia
        const strategy = strategies.get(trade.strategyId);
        const tradeIndexStrategy = strategy.trades.indexOf(tradeId);
        if (tradeIndexStrategy > -1) {
            strategy.trades.splice(tradeIndexStrategy, 1);
        }

        // Remover trade da lista principal
        const index = this.list.findIndex(t => t.id === tradeId);
        if (index > -1) {
            this.list.splice(index, 1);
        }

        storage.saveData({ 
            trades: this.list,
            brokers: brokers.list,
            strategies: strategies.list
        });
    },

    get(tradeId) {
        const trade = this.list.find(t => t.id === tradeId);
        
        if (!trade) {
            throw new Error('Operação não encontrada!');
        }

        return trade;
    },

    // Obter operações de uma corretora
    getByBroker(brokerId) {
        return this.list.filter(t => t.brokerId === brokerId);
    },

    // Obter operações de uma estratégia
    getByStrategy(strategyId) {
        return this.list.filter(t => t.strategyId === strategyId);
    },

    // Calcular métricas gerais
    getMetrics(filters = {}) {
        let filteredTrades = [...this.list];

        // Aplicar filtros
        if (filters.brokerId) {
            filteredTrades = filteredTrades.filter(t => t.brokerId === filters.brokerId);
        }
        if (filters.strategyId) {
            filteredTrades = filteredTrades.filter(t => t.strategyId === filters.strategyId);
        }
        if (filters.startDate) {
            filteredTrades = filteredTrades.filter(t => new Date(t.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            filteredTrades = filteredTrades.filter(t => new Date(t.createdAt) <= new Date(filters.endDate));
        }

        const wins = filteredTrades.filter(t => t.result > 0);
        const losses = filteredTrades.filter(t => t.result < 0);
        const totalProfit = filteredTrades.reduce((acc, t) => acc + t.result, 0);
        const totalTrades = filteredTrades.length;

        return {
            totalTrades,
            wins: wins.length,
            losses: losses.length,
            draws: totalTrades - wins.length - losses.length,
            winRate: totalTrades ? (wins.length / totalTrades) * 100 : 0,
            totalProfit,
            averageProfit: totalTrades ? totalProfit / totalTrades : 0,
            profitFactor: losses.length ? 
                Math.abs(wins.reduce((acc, t) => acc + t.result, 0) / losses.reduce((acc, t) => acc + t.result, 0)) : 
                0,
            largestWin: wins.length ? Math.max(...wins.map(t => t.result)) : 0,
            largestLoss: losses.length ? Math.min(...losses.map(t => t.result)) : 0,
            averageWin: wins.length ? wins.reduce((acc, t) => acc + t.result, 0) / wins.length : 0,
            averageLoss: losses.length ? losses.reduce((acc, t) => acc + t.result, 0) / losses.length : 0
        };
    }
}; 