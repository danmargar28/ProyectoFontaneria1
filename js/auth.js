// Authentication Controller
class AuthController {
    constructor() {
        this.bindAuthEvents();
    }

    bindAuthEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;

        try {
            const user = this.authenticateUser(email, password);
            if (user) {
                localStorage.setItem('fontline_user', JSON.stringify(user));
                this.showNotification('Inicio de sesión exitoso', 'success');
                
                // Initialize app after successful login
                setTimeout(() => {
                    app = new FontlineApp();
                }, 1000);
            } else {
                this.showNotification('Credenciales inválidas', 'error');
            }
        } catch (error) {
            this.showNotification('Error en el inicio de sesión: ' + error.message, 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        
        const userData = {
            name: form.querySelector('#registerName').value,
            email: form.querySelector('#registerEmail').value,
            phone: form.querySelector('#registerPhone').value,
            address: form.querySelector('#registerAddress').value,
            password: form.querySelector('#registerPassword').value,
            userType: form.querySelector('#registerUserType').value
        };

        try {
            if (this.validateRegistration(userData)) {
                const newUser = this.createUser(userData);
                localStorage.setItem('fontline_user', JSON.stringify(newUser));
                this.showNotification('Registro exitoso', 'success');
                
                // Initialize app after successful registration
                setTimeout(() => {
                    app = new FontlineApp();
                }, 1000);
            }
        } catch (error) {
            this.showNotification('Error en el registro: ' + error.message, 'error');
        }
    }

    authenticateUser(email, password) {
        // In a real app, this would call an API
        // For demo purposes, we'll check against our simulated data
        
        const customers = DataManager.getCustomers();
        const plumbers = DataManager.getPlumbers();
        const admins = DataManager.getAdmins();
        
        let user = null;
        let userType = null;

        // Check in customers
        user = customers.find(c => c.email === email);
        if (user) {
            userType = 'customer';
        }

        // Check in plumbers
        if (!user) {
            user = plumbers.find(p => p.email === email);
            if (user) {
                userType = 'plumber';
            }
        }

        // Check in admins
        if (!user) {
            user = admins.find(a => a.email === email);
            if (user) {
                userType = 'admin';
            }
        }

        // For demo purposes, we'll accept any password
        // In a real app, you'd verify the password hash
        if (user && password) {
            return {
                ...user,
                userType: userType
            };
        }

        return null;
    }

    validateRegistration(userData) {
        // Basic validation
        if (!userData.name || !userData.email || !userData.password) {
            throw new Error('Todos los campos obligatorios deben ser completados');
        }

        if (userData.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Check if email already exists
        const existingUsers = [
            ...DataManager.getCustomers(),
            ...DataManager.getPlumbers(),
            ...DataManager.getAdmins()
        ];

        if (existingUsers.find(u => u.email === userData.email)) {
            throw new Error('Ya existe un usuario con este email');
        }

        return true;
    }

    createUser(userData) {
        const newUser = {
            id: Date.now(), // Simple ID generation for demo
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            userType: userData.userType,
            createdAt: new Date().toISOString()
        };

        // Add user to appropriate collection
        switch (userData.userType) {
            case 'customer':
                DataManager.createCustomer(newUser);
                break;
            case 'plumber':
                DataManager.createPlumber({
                    ...newUser,
                    status: 'available',
                    specialty: 'General'
                });
                break;
            case 'admin':
                DataManager.createAdmin(newUser);
                break;
        }

        return newUser;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize auth controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthController();
});
