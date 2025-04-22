import { storage } from './storage.js';
import { auth } from './auth.js';

const trading = {
    // Adiciona uma nova operação
    addTrade(tradeData) {
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }

        const currentUser = auth.getCurrentUser();
        const trade = {
            id: Date.now().toString(),
            userId: currentUser.id,
            ...tradeData,
            createdAt: new Date().toISOString(),
            status: 'open' // open, closed, cancelled
        };

        // Validações básicas
        if (!trade.brokerId) throw new Error('Corretora é obrigatória');
        if (!trade.strategyId) throw new Error('Estratégia é obrigatória');
        if (!trade.symbol) throw new Error('Ativo é obrigatório');
        if (!trade.type || !['buy', 'sell'].includes(trade.type)) {
            throw new Error('Tipo de operação inválido');
        }
        if (!trade.quantity || trade.quantity <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }
        if (!trade.price || trade.price <= 0) {
            throw new Error('Preço deve ser maior que zero');
        }

        // Calcula o valor total da operação
        trade.total = trade.quantity * trade.price;

        if (storage.saveTrade(trade)) {
            return trade;
        }

        throw new Error('Erro ao salvar operação');
    },

    // Fecha uma operação
    closeTrade(tradeId, closeData) {
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }

        const trades = storage.getTrades();
        const trade = trades.find(t => t.id === tradeId);

        if (!trade) {
            throw new Error('Operação não encontrada');
        }

        if (trade.userId !== auth.getCurrentUser().id) {
            throw new Error('Operação não pertence ao usuário atual');
        }

        if (trade.status !== 'open') {
            throw new Error('Operação já está fechada ou cancelada');
        }

        // Validações do preço de fechamento
        if (!closeData.price || closeData.price <= 0) {
            throw new Error('Preço de fechamento deve ser maior que zero');
        }

        // Atualiza a operação
        const updatedTrade = {
            ...trade,
            closePrice: closeData.price,
            closeDate: new Date().toISOString(),
            status: 'closed',
            result: closeData.price * trade.quantity - trade.total,
            resultPercentage: ((closeData.price - trade.price) / trade.price) * 100
        };

        if (storage.saveTrade(updatedTrade)) {
            return updatedTrade;
        }

        throw new Error('Erro ao fechar operação');
    },

    // Cancela uma operação
    cancelTrade(tradeId) {
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }

        const trades = storage.getTrades();
        const trade = trades.find(t => t.id === tradeId);

        if (!trade) {
            throw new Error('Operação não encontrada');
        }

        if (trade.userId !== auth.getCurrentUser().id) {
            throw new Error('Operação não pertence ao usuário atual');
        }

        if (trade.status !== 'open') {
            throw new Error('Operação já está fechada ou cancelada');
        }

        const updatedTrade = {
            ...trade,
            status: 'cancelled',
            cancelDate: new Date().toISOString()
        };

        if (storage.saveTrade(updatedTrade)) {
            return updatedTrade;
        }

        throw new Error('Erro ao cancelar operação');
    },

    // Lista operações do usuário atual
    listTrades(filters = {}) {
        if (!auth.isAuthenticated()) {
            throw new Error('Usuário não autenticado');
        }

        const currentUser = auth.getCurrentUser();
        let trades = storage.getTrades().filter(t => t.userId === currentUser.id);

        // Aplica filtros
        if (filters.status) {
            trades = trades.filter(t => t.status === filters.status);
        }
        if (filters.brokerId) {
            trades = trades.filter(t => t.brokerId === filters.brokerId);
        }
        if (filters.strategyId) {
            trades = trades.filter(t => t.strategyId === filters.strategyId);
        }
        if (filters.symbol) {
            trades = trades.filter(t => t.symbol === filters.symbol);
        }
        if (filters.type) {
            trades = trades.filter(t => t.type === filters.type);
        }
        if (filters.startDate) {
            trades = trades.filter(t => new Date(t.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            trades = trades.filter(t => new Date(t.createdAt) <= new Date(filters.endDate));
        }

        // Ordena por data de criação (mais recente primeiro)
        return trades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // Calcula estatísticas das operações
    getTradeStats(filters = {}) {
        const trades = this.listTrades(filters);
        const closedTrades = trades.filter(t => t.status === 'closed');

        const stats = {
            total: trades.length,
            open: trades.filter(t => t.status === 'open').length,
            closed: closedTrades.length,
            cancelled: trades.filter(t => t.status === 'cancelled').length,
            profit: 0,
            loss: 0,
            totalResult: 0,
            winRate: 0,
            avgProfit: 0,
            avgLoss: 0,
            largestProfit: 0,
            largestLoss: 0
        };

        if (closedTrades.length > 0) {
            const profits = closedTrades.filter(t => t.result > 0);
            const losses = closedTrades.filter(t => t.result < 0);

            stats.profit = profits.length;
            stats.loss = losses.length;
            stats.totalResult = closedTrades.reduce((sum, t) => sum + t.result, 0);
            stats.winRate = (profits.length / closedTrades.length) * 100;

            if (profits.length > 0) {
                stats.avgProfit = profits.reduce((sum, t) => sum + t.result, 0) / profits.length;
                stats.largestProfit = Math.max(...profits.map(t => t.result));
            }

            if (losses.length > 0) {
                stats.avgLoss = losses.reduce((sum, t) => sum + t.result, 0) / losses.length;
                stats.largestLoss = Math.min(...losses.map(t => t.result));
            }
        }

        return stats;
    }
};

export { trading }; 