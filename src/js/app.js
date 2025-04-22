import { auth } from './auth.js';
import { storage } from './storage.js';
import { brokers } from './brokers.js';
import { strategies } from './strategies.js';
import { trades } from './trades.js';

export const app = {
    init() {
        // Inicializar módulos
        auth.init();
        brokers.init();
        strategies.init();
        trades.init();

        // Configurar event listeners
        this.setupEventListeners();

        // Verificar autenticação
        this.checkAuth();
    },

    setupEventListeners() {
        // Login/Registro
        document.getElementById('login-form')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('register-form')?.addEventListener('submit', this.handleRegister.bind(this));
        document.getElementById('logout-btn')?.addEventListener('click', this.handleLogout.bind(this));

        // Navegação
        document.querySelectorAll('.nav-link')?.forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // Corretoras
        document.getElementById('add-broker-form')?.addEventListener('submit', this.handleAddBroker.bind(this));
        document.getElementById('broker-list')?.addEventListener('click', this.handleBrokerAction.bind(this));

        // Estratégias
        document.getElementById('add-strategy-form')?.addEventListener('submit', this.handleAddStrategy.bind(this));
        document.getElementById('strategy-list')?.addEventListener('click', this.handleStrategyAction.bind(this));

        // Operações
        document.getElementById('add-trade-form')?.addEventListener('submit', this.handleAddTrade.bind(this));
        document.getElementById('trade-list')?.addEventListener('click', this.handleTradeAction.bind(this));

        // Backup/Restore
        document.getElementById('export-btn')?.addEventListener('click', () => storage.exportData());
        document.getElementById('import-file')?.addEventListener('change', this.handleImport.bind(this));
    },

    checkAuth() {
        const user = auth.currentUser;
        if (user) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    // Handlers de Autenticação
    async handleLogin(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            await auth.login({
                username: formData.get('username'),
                password: formData.get('password')
            });
            this.showDashboard();
            this.showNotification('Login realizado com sucesso!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'danger');
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            await auth.register({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirm-password')
            });
            this.showNotification('Conta criada com sucesso!', 'success');
            this.showLogin();
        } catch (error) {
            this.showNotification(error.message, 'danger');
        }
    },

    handleLogout() {
        auth.logout();
        this.showLogin();
        this.showNotification('Logout realizado com sucesso!', 'success');
    },

    // Handlers de Corretoras
    async handleAddBroker(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const broker = await brokers.add({
                name: formData.get('name'),
                initialBalance: formData.get('balance'),
                currency: formData.get('currency'),
                notes: formData.get('notes')
            });
            this.updateBrokersList();
            this.showNotification('Corretora adicionada com sucesso!', 'success');
            this.closeModal('add-broker-modal');
        } catch (error) {
            this.showNotification(error.message, 'danger');
        }
    },

    // Handlers de Estratégias
    async handleAddStrategy(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const strategy = await strategies.add({
                name: formData.get('name'),
                brokerId: formData.get('broker'),
                type: formData.get('type'),
                description: formData.get('description'),
                rules: formData.get('rules').split('\n').filter(Boolean)
            });
            this.updateStrategiesList();
            this.showNotification('Estratégia adicionada com sucesso!', 'success');
            this.closeModal('add-strategy-modal');
        } catch (error) {
            this.showNotification(error.message, 'danger');
        }
    },

    // Handlers de Operações
    async handleAddTrade(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const trade = await trades.add({
                brokerId: formData.get('broker'),
                strategyId: formData.get('strategy'),
                type: formData.get('type'),
                amount: formData.get('amount'),
                result: formData.get('result'),
                asset: formData.get('asset'),
                timeframe: formData.get('timeframe'),
                notes: formData.get('notes')
            });
            this.updateTradesList();
            this.updateDashboard();
            this.showNotification('Operação registrada com sucesso!', 'success');
            this.closeModal('add-trade-modal');
        } catch (error) {
            this.showNotification(error.message, 'danger');
        }
    },

    // UI Helpers
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    },

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'block';
        }
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Navegação
    showLogin() {
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('register-page').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
    },

    showRegister() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('register-page').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    },

    showDashboard() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('register-page').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        this.updateDashboard();
    },

    // Atualizações de UI
    updateDashboard() {
        this.updateBrokersList();
        this.updateStrategiesList();
        this.updateTradesList();
        this.updateMetrics();
        this.updateCharts();
    },

    updateBrokersList() {
        const brokerList = document.getElementById('broker-list');
        if (!brokerList) return;

        brokerList.innerHTML = brokers.list.map(broker => `
            <div class="card broker-card" data-id="${broker.id}">
                <h3>${broker.name}</h3>
                <p>Saldo: ${broker.currency} ${broker.currentBalance.toFixed(2)}</p>
                <p>Lucro: ${broker.currency} ${(broker.currentBalance - broker.initialBalance).toFixed(2)}</p>
                <div class="card-actions">
                    <button class="btn btn-primary edit-broker">Editar</button>
                    <button class="btn btn-danger delete-broker">Excluir</button>
                </div>
            </div>
        `).join('');
    },

    updateStrategiesList() {
        const strategyList = document.getElementById('strategy-list');
        if (!strategyList) return;

        strategyList.innerHTML = strategies.list.map(strategy => {
            const metrics = strategies.getMetrics(strategy.id);
            return `
                <div class="card strategy-card" data-id="${strategy.id}">
                    <h3>${strategy.name}</h3>
                    <p>Win Rate: ${metrics.winRate.toFixed(2)}%</p>
                    <p>Total de Trades: ${metrics.totalTrades}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary edit-strategy">Editar</button>
                        <button class="btn btn-danger delete-strategy">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateTradesList() {
        const tradeList = document.getElementById('trade-list');
        if (!tradeList) return;

        tradeList.innerHTML = trades.list.map(trade => `
            <tr data-id="${trade.id}">
                <td>${new Date(trade.createdAt).toLocaleDateString()}</td>
                <td>${trade.asset}</td>
                <td>${trade.type}</td>
                <td>${trade.result > 0 ? 'Gain' : 'Loss'}</td>
                <td>${trade.result.toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-trade">Editar</button>
                    <button class="btn btn-danger btn-sm delete-trade">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    updateMetrics() {
        const metricsContainer = document.getElementById('metrics');
        if (!metricsContainer) return;

        const globalMetrics = trades.getMetrics();
        metricsContainer.innerHTML = `
            <div class="grid">
                <div class="card">
                    <h3>Win Rate</h3>
                    <p class="metric">${globalMetrics.winRate.toFixed(2)}%</p>
                </div>
                <div class="card">
                    <h3>Lucro Total</h3>
                    <p class="metric">${globalMetrics.totalProfit.toFixed(2)}</p>
                </div>
                <div class="card">
                    <h3>Fator de Lucro</h3>
                    <p class="metric">${globalMetrics.profitFactor.toFixed(2)}</p>
                </div>
                <div class="card">
                    <h3>Total de Trades</h3>
                    <p class="metric">${globalMetrics.totalTrades}</p>
                </div>
            </div>
        `;
    },

    updateCharts() {
        // Implementar atualização dos gráficos usando Chart.js
        // Esta função será implementada quando criarmos a interface
    },

    // Import/Export
    async handleImport(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                const success = await storage.importData(file);
                if (success) {
                    this.showNotification('Dados importados com sucesso!', 'success');
                    this.init(); // Reinicializar app com novos dados
                } else {
                    this.showNotification('Erro ao importar dados!', 'danger');
                }
            } catch (error) {
                this.showNotification('Erro ao importar dados!', 'danger');
            }
        }
    }
};

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => app.init()); 