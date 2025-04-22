import { storage } from './storage.js';
import { v4 as uuidv4 } from 'uuid';

const auth = {
    // Registra um novo usuário
    register(userData) {
        // Valida dados obrigatórios
        if (!userData.email || !userData.password || !userData.name) {
            throw new Error('Email, senha e nome são obrigatórios');
        }

        // Verifica se email já existe
        const users = storage.getUsers();
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Email já cadastrado');
        }

        // Cria novo usuário
        const user = {
            id: uuidv4(),
            email: userData.email,
            name: userData.name,
            password: this._hashPassword(userData.password), // Em produção usar bcrypt
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Salva usuário
        if (storage.saveUser(user)) {
            // Remove senha antes de retornar
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        throw new Error('Erro ao salvar usuário');
    },

    // Faz login do usuário
    login(email, password) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        const users = storage.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (user.password !== this._hashPassword(password)) {
            throw new Error('Senha incorreta');
        }

        // Remove senha antes de salvar na sessão
        const { password: _, ...userWithoutPassword } = user;
        
        // Salva usuário na sessão
        if (storage.setCurrentUser(userWithoutPassword)) {
            return userWithoutPassword;
        }

        throw new Error('Erro ao fazer login');
    },

    // Faz logout do usuário
    logout() {
        storage.clearCurrentUser();
    },

    // Retorna usuário atual
    getCurrentUser() {
        return storage.getCurrentUser();
    },

    // Verifica se usuário está logado
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Atualiza dados do usuário
    updateProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não está logado');
        }

        // Não permite atualizar email ou senha por esta função
        delete updates.email;
        delete updates.password;

        const updatedUser = {
            ...currentUser,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        if (storage.saveUser(updatedUser)) {
            storage.setCurrentUser(updatedUser);
            return updatedUser;
        }

        throw new Error('Erro ao atualizar perfil');
    },

    // Atualiza senha do usuário
    updatePassword(currentPassword, newPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuário não está logado');
        }

        // Busca usuário com senha
        const users = storage.getUsers();
        const user = users.find(u => u.id === currentUser.id);

        // Verifica senha atual
        if (user.password !== this._hashPassword(currentPassword)) {
            throw new Error('Senha atual incorreta');
        }

        // Atualiza senha
        const updatedUser = {
            ...user,
            password: this._hashPassword(newPassword),
            updatedAt: new Date().toISOString()
        };

        if (storage.saveUser(updatedUser)) {
            const { password, ...userWithoutPassword } = updatedUser;
            storage.setCurrentUser(userWithoutPassword);
            return userWithoutPassword;
        }

        throw new Error('Erro ao atualizar senha');
    },

    // Função auxiliar para hash de senha
    // Em produção usar bcrypt ou similar
    _hashPassword(password) {
        return btoa(password); // Apenas para demo, NÃO usar em produção
    }
};

export { auth }; 