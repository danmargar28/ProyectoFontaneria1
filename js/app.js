// Main Application Controller
class FontlineApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        // Check if user is logged in
        const storedUser = localStorage.getItem('fontline_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showApp();
        } else {
            this.showAuth();
        }

        // Bind event listeners
        this.bindEvents();
        
        // Load initial data
        this.loadDashboardData();
    }

    bindEvents() {
        // Form submissions
        document.getElementById('serviceForm').addEventListener('submit', (e) => this.handleServiceSubmit(e));
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('orderForm').addEventListener('submit', (e) => this.handleOrderSubmit(e));
        document.getElementById('profileForm').addEventListener('submit', (e) => this.handleProfileSubmit(e));

        // Modal close on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    showAuth() {
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
        document.querySelector('.header').style.display = 'none';
    }

    showApp() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        document.querySelector('.header').style.display = 'block';
        
        // Update header with user info
        document.getElementById('userName').textContent = this.currentUser.name;
        
        // Update navigation based on user role
        this.updateNavigation();
        
        // Show dashboard by default
        this.showView('dashboard');
    }

    updateNavigation() {
        const nav = document.getElementById('mainNav');
        const isAdmin = this.currentUser.userType === 'admin';
        
        // Add admin-only navigation items
        if (isAdmin) {
            const adminItems = `
                <li><a href="#" onclick="showView('customers')">Clientes</a></li>
                <li><a href="#" onclick="showView('plumbers')">Fontaneros</a></li>
            `;
            nav.querySelector('ul').insertAdjacentHTML('beforeend', adminItems);
        }
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Load view-specific data
            switch (viewName) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'services':
                    this.loadServicesData();
                    break;
                case 'products':
                    this.loadProductsData();
                    break;
                case 'profile':
                    this.loadProfileData();
                    break;
                case 'customers':
                    if (this.currentUser.userType === 'admin') {
                        this.loadCustomersData();
                    }
                    break;
                case 'plumbers':
                    if (this.currentUser.userType === 'admin') {
                        this.loadPlumbersData();
                    }
                    break;
            }
        }
    }

    loadDashboardData() {
        const services = DataManager.getServices();
        const orders = DataManager.getOrders();
        const plumbers = DataManager.getPlumbers();

        // Update dashboard cards
        document.getElementById('activeServices').textContent = 
            services.filter(s => s.status === 'in_progress').length;
        document.getElementById('pendingOrders').textContent = 
            orders.filter(o => o.status === 'pending').length;
        document.getElementById('availablePlumbers').textContent = 
            plumbers.filter(p => p.status === 'available').length;

        // Load recent activities
        this.loadRecentActivities();
    }

    loadRecentActivities() {
        const services = DataManager.getServices().slice(0, 5);
        const customers = DataManager.getCustomers();
        const plumbers = DataManager.getPlumbers();
        
        const tbody = document.getElementById('recentActivities');
        tbody.innerHTML = services.map(service => {
            const customer = customers.find(c => c.id === service.customerId);
            const plumber = plumbers.find(p => p.id === service.plumberId);
            
            return `
                <tr>
                    <td>${this.formatDate(service.createdAt)}</td>
                    <td>${customer ? customer.name : 'N/A'}</td>
                    <td>${this.capitalizeFirst(service.type)}</td>
                    <td><span class="status-badge status-${service.status}">${this.formatStatus(service.status)}</span></td>
                    <td>${plumber ? plumber.name : 'Sin asignar'}</td>
                </tr>
            `;
        }).join('');
    }

    loadServicesData() {
        const services = DataManager.getServices();
        const customers = DataManager.getCustomers();
        const plumbers = DataManager.getPlumbers();
        
        const tbody = document.getElementById('servicesTable');
        tbody.innerHTML = services.map(service => {
            const customer = customers.find(c => c.id === service.customerId);
            const plumber = plumbers.find(p => p.id === service.plumberId);
            
            return `
                <tr>
                    <td>#${service.id}</td>
                    <td>${customer ? customer.name : 'N/A'}</td>
                    <td>${this.capitalizeFirst(service.type)}</td>
                    <td>${service.description}</td>
                    <td><span class="status-badge status-${service.status}">${this.formatStatus(service.status)}</span></td>
                    <td>${plumber ? plumber.name : 'Sin asignar'}</td>
                    <td>${this.formatDate(service.scheduledDate)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-small btn-primary" onclick="app.editService(${service.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${service.status === 'pending' ? `
                                <button class="btn btn-small btn-success" onclick="app.approveService(${service.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-small btn-error" onclick="app.rejectService(${service.id})">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="btn btn-small btn-error" onclick="app.deleteService(${service.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Populate customer and plumber dropdowns in modal
        this.populateServiceModal();
    }

    loadProductsData() {
        const products = DataManager.getProducts();
        const grid = document.getElementById('productsGrid');
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-header">
                    <div>
                        <h3 class="product-title">${product.name}</h3>
                        <span class="product-category">${product.category}</span>
                    </div>
                </div>
                <div class="product-price">€${product.price.toFixed(2)}</div>
                <div class="product-description">${product.description || 'Sin descripción'}</div>
                <div class="product-stock">Stock: ${product.stock} unidades</div>
                ${product.includesInstallation ? '<div class="mb-2"><i class="fas fa-tools"></i> Incluye instalación</div>' : ''}
                <div class="product-actions">
                    ${this.currentUser.userType === 'customer' ? `
                        <button class="btn btn-primary" onclick="app.orderProduct(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Pedir
                        </button>
                    ` : ''}
                    ${this.currentUser.userType === 'admin' ? `
                        <button class="btn btn-secondary" onclick="app.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-error" onclick="app.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    loadProfileData() {
        const form = document.getElementById('profileForm');
        form.querySelector('#profileName').value = this.currentUser.name;
        form.querySelector('#profileEmail').value = this.currentUser.email;
        form.querySelector('#profilePhone').value = this.currentUser.phone || '';
        form.querySelector('#profileAddress').value = this.currentUser.address || '';
    }

    loadCustomersData() {
        if (this.currentUser.userType !== 'admin') return;
        
        const customers = DataManager.getCustomers();
        const tbody = document.getElementById('customersTable');
        
        tbody.innerHTML = customers.map(customer => {
            const services = DataManager.getServices().filter(s => s.customerId === customer.id);
            
            return `
                <tr>
                    <td>#${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>${services.length}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-small btn-primary" onclick="app.editCustomer(${customer.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small btn-error" onclick="app.deleteCustomer(${customer.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadPlumbersData() {
        if (this.currentUser.userType !== 'admin') return;
        
        const plumbers = DataManager.getPlumbers();
        const tbody = document.getElementById('plumbersTable');
        
        tbody.innerHTML = plumbers.map(plumber => {
            const services = DataManager.getServices().filter(s => s.plumberId === plumber.id);
            
            return `
                <tr>
                    <td>#${plumber.id}</td>
                    <td>${plumber.name}</td>
                    <td>${plumber.email}</td>
                    <td>${plumber.phone || 'N/A'}</td>
                    <td>${plumber.specialty || 'General'}</td>
                    <td><span class="status-badge status-${plumber.status}">${this.formatStatus(plumber.status)}</span></td>
                    <td>${services.filter(s => s.status === 'in_progress').length}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-small btn-primary" onclick="app.editPlumber(${plumber.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small btn-${plumber.status === 'available' ? 'warning' : 'success'}" 
                                    onclick="app.togglePlumberStatus(${plumber.id})">
                                <i class="fas fa-${plumber.status === 'available' ? 'pause' : 'play'}"></i>
                            </button>
                            <button class="btn btn-small btn-error" onclick="app.deletePlumber(${plumber.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Service Management
    showServiceModal(serviceId = null) {
        const modal = document.getElementById('serviceModal');
        const form = document.getElementById('serviceForm');
        const title = document.getElementById('serviceModalTitle');
        
        if (serviceId) {
            const service = DataManager.getServices().find(s => s.id === serviceId);
            if (service) {
                title.textContent = 'Editar Servicio';
                form.querySelector('#serviceId').value = service.id;
                form.querySelector('#serviceCustomer').value = service.customerId;
                form.querySelector('#serviceType').value = service.type;
                form.querySelector('#serviceDescription').value = service.description;
                form.querySelector('#servicePlumber').value = service.plumberId || '';
                form.querySelector('#serviceDate').value = service.scheduledDate;
            }
        } else {
            title.textContent = 'Nuevo Servicio';
            form.reset();
        }
        
        this.populateServiceModal();
        modal.style.display = 'block';
    }

    populateServiceModal() {
        const customers = DataManager.getCustomers();
        const plumbers = DataManager.getPlumbers();
        const products = DataManager.getProducts();
        
        const customerSelect = document.getElementById('serviceCustomer');
        const plumberSelect = document.getElementById('servicePlumber');
        const productsSelect = document.getElementById('serviceProducts');
        
        customerSelect.innerHTML = '<option value="">Seleccionar Cliente</option>' +
            customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            
        plumberSelect.innerHTML = '<option value="">Sin Asignar</option>' +
            plumbers.filter(p => p.status === 'available').map(p => 
                `<option value="${p.id}">${p.name}</option>`).join('');
                
        productsSelect.innerHTML = products.map(p => 
            `<option value="${p.id}">${p.name} - €${p.price.toFixed(2)}</option>`).join('');
    }

    handleServiceSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const serviceData = {
            id: formData.get('serviceId') || undefined,
            customerId: parseInt(formData.get('serviceCustomer')),
            type: formData.get('serviceType'),
            description: formData.get('serviceDescription'),
            plumberId: formData.get('servicePlumber') ? parseInt(formData.get('servicePlumber')) : null,
            scheduledDate: formData.get('serviceDate'),
            status: 'pending'
        };

        try {
            if (serviceData.id) {
                DataManager.updateService(parseInt(serviceData.id), serviceData);
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                DataManager.createService(serviceData);
                this.showNotification('Servicio creado correctamente', 'success');
            }
            
            this.closeModal('serviceModal');
            this.loadServicesData();
            this.loadDashboardData();
        } catch (error) {
            this.showNotification('Error al guardar el servicio: ' + error.message, 'error');
        }
    }

    editService(serviceId) {
        this.showServiceModal(serviceId);
    }

    approveService(serviceId) {
        try {
            DataManager.updateService(serviceId, { status: 'approved' });
            this.showNotification('Servicio aprobado', 'success');
            this.loadServicesData();
            this.loadDashboardData();
        } catch (error) {
            this.showNotification('Error al aprobar el servicio', 'error');
        }
    }

    rejectService(serviceId) {
        try {
            DataManager.updateService(serviceId, { status: 'cancelled' });
            this.showNotification('Servicio rechazado', 'warning');
            this.loadServicesData();
            this.loadDashboardData();
        } catch (error) {
            this.showNotification('Error al rechazar el servicio', 'error');
        }
    }

    deleteService(serviceId) {
        if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
            try {
                DataManager.deleteService(serviceId);
                this.showNotification('Servicio eliminado', 'success');
                this.loadServicesData();
                this.loadDashboardData();
            } catch (error) {
                this.showNotification('Error al eliminar el servicio', 'error');
            }
        }
    }

    // Product Management
    showProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        if (productId) {
            const product = DataManager.getProducts().find(p => p.id === productId);
            if (product) {
                title.textContent = 'Editar Producto';
                form.querySelector('#productId').value = product.id;
                form.querySelector('#productName').value = product.name;
                form.querySelector('#productCategory').value = product.category;
                form.querySelector('#productPrice').value = product.price;
                form.querySelector('#productStock').value = product.stock;
                form.querySelector('#productDescription').value = product.description || '';
                form.querySelector('#productInstallation').checked = product.includesInstallation;
            }
        } else {
            title.textContent = 'Nuevo Producto';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    handleProductSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const productData = {
            id: formData.get('productId') || undefined,
            name: formData.get('productName'),
            category: formData.get('productCategory'),
            price: parseFloat(formData.get('productPrice')),
            stock: parseInt(formData.get('productStock')),
            description: formData.get('productDescription'),
            includesInstallation: formData.has('productInstallation')
        };

        try {
            if (productData.id) {
                DataManager.updateProduct(parseInt(productData.id), productData);
                this.showNotification('Producto actualizado correctamente', 'success');
            } else {
                DataManager.createProduct(productData);
                this.showNotification('Producto creado correctamente', 'success');
            }
            
            this.closeModal('productModal');
            this.loadProductsData();
        } catch (error) {
            this.showNotification('Error al guardar el producto: ' + error.message, 'error');
        }
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                DataManager.deleteProduct(productId);
                this.showNotification('Producto eliminado', 'success');
                this.loadProductsData();
            } catch (error) {
                this.showNotification('Error al eliminar el producto', 'error');
            }
        }
    }

    orderProduct(productId) {
        const modal = document.getElementById('orderModal');
        const select = document.getElementById('orderProduct');
        const products = DataManager.getProducts();
        
        select.innerHTML = '<option value="">Seleccionar Producto</option>' +
            products.map(p => `<option value="${p.id}">${p.name} - €${p.price.toFixed(2)}</option>`).join('');
            
        select.value = productId;
        modal.style.display = 'block';
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const orderData = {
            customerId: this.currentUser.id,
            productId: parseInt(formData.get('orderProduct')),
            quantity: parseInt(formData.get('orderQuantity')),
            includesInstallation: formData.has('orderInstallation'),
            notes: formData.get('orderNotes'),
            status: 'pending'
        };

        try {
            DataManager.createOrder(orderData);
            this.showNotification('Pedido realizado correctamente', 'success');
            this.closeModal('orderModal');
            this.loadDashboardData();
        } catch (error) {
            this.showNotification('Error al realizar el pedido: ' + error.message, 'error');
        }
    }

    handleProfileSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const profileData = {
            name: formData.get('profileName'),
            email: formData.get('profileEmail'),
            phone: formData.get('profilePhone'),
            address: formData.get('profileAddress')
        };

        try {
            // Update current user
            Object.assign(this.currentUser, profileData);
            localStorage.setItem('fontline_user', JSON.stringify(this.currentUser));
            
            // Update in data store
            DataManager.updateCustomer(this.currentUser.id, profileData);
            
            this.showNotification('Perfil actualizado correctamente', 'success');
            document.getElementById('userName').textContent = this.currentUser.name;
        } catch (error) {
            this.showNotification('Error al actualizar el perfil: ' + error.message, 'error');
        }
    }

    // Utility methods
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
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

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'approved': 'Aprobado',
            'in_progress': 'En Progreso',
            'completed': 'Completado',
            'cancelled': 'Cancelado',
            'available': 'Disponible',
            'busy': 'Ocupado'
        };
        return statusMap[status] || status;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    filterServices() {
        const typeFilter = document.getElementById('serviceTypeFilter').value;
        const statusFilter = document.getElementById('serviceStatusFilter').value;
        
        // This would filter the services in a real implementation
        this.loadServicesData();
    }

    togglePlumberStatus(plumberId) {
        try {
            const plumber = DataManager.getPlumbers().find(p => p.id === plumberId);
            const newStatus = plumber.status === 'available' ? 'busy' : 'available';
            
            DataManager.updatePlumber(plumberId, { status: newStatus });
            this.showNotification(`Estado del fontanero actualizado a ${this.formatStatus(newStatus)}`, 'success');
            this.loadPlumbersData();
            this.loadDashboardData();
        } catch (error) {
            this.showNotification('Error al actualizar el estado del fontanero', 'error');
        }
    }
}

// Global functions for HTML onclick handlers
function showView(viewName) {
    app.showView(viewName);
}

function showServiceModal(serviceId) {
    app.showServiceModal(serviceId);
}

function showProductModal(productId) {
    app.showProductModal(productId);
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function logout() {
    localStorage.removeItem('fontline_user');
    location.reload();
}

function showAuthView(view) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(view + 'View').classList.add('active');
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FontlineApp();
});
