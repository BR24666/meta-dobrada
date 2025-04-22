const storage = {
    // Chaves para o localStorage
    KEYS: {
        USERS: 'meta_dobrada_users',
        TRADES: 'meta_dobrada_trades',
        BROKERS: 'meta_dobrada_brokers',
        STRATEGIES: 'meta_dobrada_strategies',
        CURRENT_USER: 'meta_dobrada_current_user'
    },

    // Funções auxiliares
    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Erro ao ler ${key}:`, error);
            return null;
        }
    },

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Erro ao salvar ${key}:`, error);
            return false;
        }
    },

    // Usuários
    getUsers() {
        return this._get(this.KEYS.USERS) || [];
    },

    saveUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }

        return this._set(this.KEYS.USERS, users);
    },

    getCurrentUser() {
        return this._get(this.KEYS.CURRENT_USER);
    },

    setCurrentUser(user) {
        return this._set(this.KEYS.CURRENT_USER, user);
    },

    clearCurrentUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // Operações
    getTrades() {
        return this._get(this.KEYS.TRADES) || [];
    },

    saveTrade(trade) {
        const trades = this.getTrades();
        const index = trades.findIndex(t => t.id === trade.id);
        
        if (index >= 0) {
            trades[index] = trade;
        } else {
            trades.push(trade);
        }

        return this._set(this.KEYS.TRADES, trades);
    },

    // Corretoras
    getBrokers() {
        return this._get(this.KEYS.BROKERS) || [];
    },

    saveBroker(broker) {
        const brokers = this.getBrokers();
        const index = brokers.findIndex(b => b.id === broker.id);
        
        if (index >= 0) {
            brokers[index] = broker;
        } else {
            brokers.push(broker);
        }

        return this._set(this.KEYS.BROKERS, brokers);
    },

    // Estratégias
    getStrategies() {
        return this._get(this.KEYS.STRATEGIES) || [];
    },

    saveStrategy(strategy) {
        const strategies = this.getStrategies();
        const index = strategies.findIndex(s => s.id === strategy.id);
        
        if (index >= 0) {
            strategies[index] = strategy;
        } else {
            strategies.push(strategy);
        }

        return this._set(this.KEYS.STRATEGIES, strategies);
    },

    // Limpa todos os dados
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Função para backup dos dados
    exportData() {
        const data = this.loadData();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metadobrada_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    },

    // Função para importar backup
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            this.saveData(data);
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }
};

export { storage }; 