// Data Manager - Simulates backend data operations
class DataManager {
    static init() {
        // Initialize with sample data if not exists
        if (!localStorage.getItem('fontline_customers')) {
            this.seedData();
        }
    }

    static seedData() {
        const customers = [
            {
                id: 1,
                name: 'María García',
                email: 'maria.garcia@email.com',
                phone: '+34 666 111 222',
                address: 'Calle Mayor 15, Madrid',
                createdAt: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                name: 'Juan Rodríguez',
                email: 'juan.rodriguez@email.com',
                phone: '+34 666 333 444',
                address: 'Avenida de la Paz 23, Barcelona',
                createdAt: '2024-01-20T14:30:00Z'
            },
            {
                id: 3,
                name: 'Ana López',
                email: 'ana.lopez@email.com',
                phone: '+34 666 555 666',
                address: 'Plaza España 8, Valencia',
                createdAt: '2024-01-25T09:15:00Z'
            }
        ];

        const plumbers = [
            {
                id: 1,
                name: 'Carlos Martín',
                email: 'carlos.martin@fontline.com',
                phone: '+34 777 111 222',
                specialty: 'Instalaciones',
                status: 'available',
                createdAt: '2024-01-01T08:00:00Z'
            },
            {
                id: 2,
                name: 'David Fernández',
                email: 'david.fernandez@fontline.com',
                phone: '+34 777 333 444',
                specialty: 'Reparaciones',
                status: 'busy',
                createdAt: '2024-01-01T08:00:00Z'
            },
            {
                id: 3,
                name: 'Roberto Sánchez',
                email: 'roberto.sanchez@fontline.com',
                phone: '+34 777 555 666',
                specialty: 'General',
                status: 'available',
                createdAt: '2024-01-01T08:00:00Z'
            }
        ];

        const admins = [
            {
                id: 1,
                name: 'Administrador Sistema',
                email: 'admin@fontline.com',
                phone: '+34 900 100 200',
                createdAt: '2024-01-01T00:00:00Z'
            }
        ];

        const products = [
            {
                id: 1,
                name: 'Grifo Monomando Cocina',
                category: 'faucets',
                price: 89.99,
                stock: 25,
                description: 'Grifo monomando para cocina con caño alto y acabado cromado',
                includesInstallation: true
            },
            {
                id: 2,
                name: 'Inodoro Suspendido',
                category: 'toilets',
                price: 299.99,
                stock: 10,
                description: 'Inodoro suspendido de porcelana blanca con cisterna empotrada',
                includesInstallation: true
            },
            {
                id: 3,
                name: 'Tubería PVC 32mm',
                category: 'pipes',
                price: 15.50,
                stock: 100,
                description: 'Tubería de PVC para evacuación, diámetro 32mm, longitud 2m',
                includesInstallation: false
            },
            {
                id: 4,
                name: 'Ducha Termostática',
                category: 'faucets',
                price: 179.99,
                stock: 15,
                description: 'Grifo termostático para ducha con rociador y flexo',
                includesInstallation: true
            },
            {
                id: 5,
                name: 'Llave Inglesa 12"',
                category: 'tools',
                price: 24.99,
                stock: 50,
                description: 'Llave inglesa de 12 pulgadas para fontanería',
                includesInstallation: false
            }
        ];

        const services = [
            {
                id: 1,
                customerId: 1,
                plumberId: 1,
                type: 'installation',
                description: 'Instalación de grifo en cocina',
                status: 'completed',
                scheduledDate: '2024-01-20T10:00:00Z',
                createdAt: '2024-01-18T15:30:00Z',
                products: [1]
            },
            {
                id: 2,
                customerId: 2,
                plumberId: 2,
                type: 'repair',
                description: 'Reparación de fuga en tubería principal',
                status: 'in_progress',
                scheduledDate: '2024-01-28T09:00:00Z',
                createdAt: '2024-01-26T11:20:00Z',
                products: [3]
            },
            {
                id: 3,
                customerId: 3,
                plumberId: null,
                type: 'installation',
                description: 'Instalación de inodoro suspendido',
                status: 'pending',
                scheduledDate: '2024-02-05T14:00:00Z',
                createdAt: '2024-01-30T16:45:00Z',
                products: [2]
            }
        ];

        const orders = [
            {
                id: 1,
                customerId: 1,
                productId: 4,
                quantity: 1,
                status: 'pending',
                includesInstallation: true,
                notes: 'Para baño principal',
                createdAt: '2024-01-25T12:00:00Z'
            },
            {
                id: 2,
                customerId: 2,
                productId: 3,
                quantity: 5,
                status: 'approved',
                includesInstallation: false,
                notes: 'Material para reparación',
                createdAt: '2024-01-26T08:30:00Z'
            }
        ];

        // Store in localStorage
        localStorage.setItem('fontline_customers', JSON.stringify(customers));
        localStorage.setItem('fontline_plumbers', JSON.stringify(plumbers));
        localStorage.setItem('fontline_admins', JSON.stringify(admins));
        localStorage.setItem('fontline_products', JSON.stringify(products));
        localStorage.setItem('fontline_services', JSON.stringify(services));
        localStorage.setItem('fontline_orders', JSON.stringify(orders));
    }

    // Customer CRUD operations
    static getCustomers() {
        return JSON.parse(localStorage.getItem('fontline_customers') || '[]');
    }

    static getCustomer(id) {
        const customers = this.getCustomers();
        return customers.find(c => c.id === id);
    }

    static createCustomer(customerData) {
        const customers = this.getCustomers();
        const newCustomer = {
            id: this.generateId(customers),
            ...customerData,
            createdAt: new Date().toISOString()
        };
        customers.push(newCustomer);
        localStorage.setItem('fontline_customers', JSON.stringify(customers));
        return newCustomer;
    }

    static updateCustomer(id, updateData) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente no encontrado');
        
        customers[index] = { ...customers[index], ...updateData, updatedAt: new Date().toISOString() };
        localStorage.setItem('fontline_customers', JSON.stringify(customers));
        return customers[index];
    }

    static deleteCustomer(id) {
        const customers = this.getCustomers();
        const filteredCustomers = customers.filter(c => c.id !== id);
        localStorage.setItem('fontline_customers', JSON.stringify(filteredCustomers));
        return true;
    }

    // Plumber CRUD operations
    static getPlumbers() {
        return JSON.parse(localStorage.getItem('fontline_plumbers') || '[]');
    }

    static getPlumber(id) {
        const plumbers = this.getPlumbers();
        return plumbers.find(p => p.id === id);
    }

    static createPlumber(plumberData) {
        const plumbers = this.getPlumbers();
        const newPlumber = {
            id: this.generateId(plumbers),
            ...plumberData,
            createdAt: new Date().toISOString()
        };
        plumbers.push(newPlumber);
        localStorage.setItem('fontline_plumbers', JSON.stringify(plumbers));
        return newPlumber;
    }

    static updatePlumber(id, updateData) {
        const plumbers = this.getPlumbers();
        const index = plumbers.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Fontanero no encontrado');
        
        plumbers[index] = { ...plumbers[index], ...updateData, updatedAt: new Date().toISOString() };
        localStorage.setItem('fontline_plumbers', JSON.stringify(plumbers));
        return plumbers[index];
    }

    static deletePlumber(id) {
        const plumbers = this.getPlumbers();
        const filteredPlumbers = plumbers.filter(p => p.id !== id);
        localStorage.setItem('fontline_plumbers', JSON.stringify(filteredPlumbers));
        return true;
    }

    // Admin operations
    static getAdmins() {
        return JSON.parse(localStorage.getItem('fontline_admins') || '[]');
    }

    static createAdmin(adminData) {
        const admins = this.getAdmins();
        const newAdmin = {
            id: this.generateId(admins),
            ...adminData,
            createdAt: new Date().toISOString()
        };
        admins.push(newAdmin);
        localStorage.setItem('fontline_admins', JSON.stringify(admins));
        return newAdmin;
    }

    // Product CRUD operations
    static getProducts() {
        return JSON.parse(localStorage.getItem('fontline_products') || '[]');
    }

    static getProduct(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    }

    static createProduct(productData) {
        const products = this.getProducts();
        const newProduct = {
            id: this.generateId(products),
            ...productData,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        localStorage.setItem('fontline_products', JSON.stringify(products));
        return newProduct;
    }

    static updateProduct(id, updateData) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Producto no encontrado');
        
        products[index] = { ...products[index], ...updateData, updatedAt: new Date().toISOString() };
        localStorage.setItem('fontline_products', JSON.stringify(products));
        return products[index];
    }

    static deleteProduct(id) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        localStorage.setItem('fontline_products', JSON.stringify(filteredProducts));
        return true;
    }

    // Service CRUD operations
    static getServices() {
        return JSON.parse(localStorage.getItem('fontline_services') || '[]');
    }

    static getService(id) {
        const services = this.getServices();
        return services.find(s => s.id === id);
    }

    static createService(serviceData) {
        const services = this.getServices();
        const newService = {
            id: this.generateId(services),
            ...serviceData,
            createdAt: new Date().toISOString()
        };
        services.push(newService);
        localStorage.setItem('fontline_services', JSON.stringify(services));
        return newService;
    }

    static updateService(id, updateData) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Servicio no encontrado');
        
        services[index] = { ...services[index], ...updateData, updatedAt: new Date().toISOString() };
        localStorage.setItem('fontline_services', JSON.stringify(services));
        return services[index];
    }

    static deleteService(id) {
        const services = this.getServices();
        const filteredServices = services.filter(s => s.id !== id);
        localStorage.setItem('fontline_services', JSON.stringify(filteredServices));
        return true;
    }

    // Order CRUD operations
    static getOrders() {
        return JSON.parse(localStorage.getItem('fontline_orders') || '[]');
    }

    static getOrder(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    }

    static createOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: this.generateId(orders),
            ...orderData,
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('fontline_orders', JSON.stringify(orders));
        return newOrder;
    }

    static updateOrder(id, updateData) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Pedido no encontrado');
        
        orders[index] = { ...orders[index], ...updateData, updatedAt: new Date().toISOString() };
        localStorage.setItem('fontline_orders', JSON.stringify(orders));
        return orders[index];
    }

    static deleteOrder(id) {
        const orders = this.getOrders();
        const filteredOrders = orders.filter(o => o.id !== id);
        localStorage.setItem('fontline_orders', JSON.stringify(filteredOrders));
        return true;
    }

    // Utility methods
    static generateId(array) {
        if (array.length === 0) return 1;
        return Math.max(...array.map(item => item.id)) + 1;
    }

    static clearAllData() {
        localStorage.removeItem('fontline_customers');
        localStorage.removeItem('fontline_plumbers');
        localStorage.removeItem('fontline_admins');
        localStorage.removeItem('fontline_products');
        localStorage.removeItem('fontline_services');
        localStorage.removeItem('fontline_orders');
    }

    static exportData() {
        return {
            customers: this.getCustomers(),
            plumbers: this.getPlumbers(),
            admins: this.getAdmins(),
            products: this.getProducts(),
            services: this.getServices(),
            orders: this.getOrders()
        };
    }

    static importData(data) {
        if (data.customers) localStorage.setItem('fontline_customers', JSON.stringify(data.customers));
        if (data.plumbers) localStorage.setItem('fontline_plumbers', JSON.stringify(data.plumbers));
        if (data.admins) localStorage.setItem('fontline_admins', JSON.stringify(data.admins));
        if (data.products) localStorage.setItem('fontline_products', JSON.stringify(data.products));
        if (data.services) localStorage.setItem('fontline_services', JSON.stringify(data.services));
        if (data.orders) localStorage.setItem('fontline_orders', JSON.stringify(data.orders));
    }
}

// Initialize data when script loads
DataManager.init();
