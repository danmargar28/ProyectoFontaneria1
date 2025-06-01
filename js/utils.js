// Utility functions for the Fontline application
class Utils {
    // Date formatting utilities
    static formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        
        switch (format) {
            case 'short':
                return date.toLocaleDateString('es-ES');
            case 'long':
                return date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'datetime':
                return date.toLocaleString('es-ES');
            case 'time':
                return date.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            default:
                return date.toLocaleDateString('es-ES');
        }
    }

    // Currency formatting
    static formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Phone number formatting
    static formatPhone(phoneNumber) {
        if (!phoneNumber) return '';
        
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Format Spanish phone numbers
        if (cleaned.startsWith('34')) {
            // International format
            const number = cleaned.substring(2);
            return `+34 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
        } else if (cleaned.length === 9) {
            // National format
            return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
        }
        
        return phoneNumber;
    }

    // String utilities
    static capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static capitalizeWords(str) {
        if (!str) return '';
        return str.split(' ').map(word => this.capitalizeFirst(word)).join(' ');
    }

    static truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Validation utilities
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePhone(phone) {
        // Spanish phone number validation
        const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;
        const cleaned = phone.replace(/\s/g, '');
        return phoneRegex.test(cleaned);
    }

    static validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    // Form utilities
    static getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes, multi-select)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    static setFormData(formElement, data) {
        Object.keys(data).forEach(key => {
            const field = formElement.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(data[key]);
                } else if (field.type === 'radio') {
                    const radioButton = formElement.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radioButton) radioButton.checked = true;
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    }

    static clearForm(formElement) {
        formElement.reset();
        
        // Clear custom validation messages
        const errorElements = formElement.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
        
        // Remove error classes
        const fields = formElement.querySelectorAll('.error');
        fields.forEach(field => field.classList.remove('error'));
    }

    // DOM utilities
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(attr => {
            if (attr === 'className') {
                element.className = attributes[attr];
            } else if (attr === 'innerHTML') {
                element.innerHTML = attributes[attr];
            } else {
                element.setAttribute(attr, attributes[attr]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }

    static showElement(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = 'block';
            element.classList.remove('hidden');
        }
    }

    static hideElement(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
        }
    }

    static toggleElement(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            if (element.style.display === 'none' || element.classList.contains('hidden')) {
                this.showElement(element);
            } else {
                this.hideElement(element);
            }
        }
    }

    // Loading and spinner utilities
    static showLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    }

    static hideLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }

    // Local storage utilities
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Array utilities
    static sortBy(array, key, direction = 'asc') {
        return array.sort((a, b) => {
            const aVal = this.getNestedValue(a, key);
            const bVal = this.getNestedValue(b, key);
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    static filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                const itemValue = this.getNestedValue(item, key);
                
                if (filterValue === '' || filterValue === null || filterValue === undefined) {
                    return true;
                }
                
                if (typeof filterValue === 'string') {
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                }
                
                return itemValue === filterValue;
            });
        });
    }

    static getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    // Debounce utility
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Status formatting
    static formatStatus(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'approved': 'Aprobado',
            'in_progress': 'En Progreso',
            'completed': 'Completado',
            'cancelled': 'Cancelado',
            'available': 'Disponible',
            'busy': 'Ocupado',
            'delivered': 'Entregado',
            'shipped': 'Enviado'
        };
        return statusMap[status] || this.capitalizeFirst(status);
    }

    static getStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'in_progress': 'status-in-progress',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled',
            'available': 'status-available',
            'busy': 'status-busy',
            'delivered': 'status-completed',
            'shipped': 'status-in-progress'
        };
        return statusClasses[status] || 'status-pending';
    }

    // Error handling
    static handleError(error, showToUser = true) {
        console.error('Application Error:', error);
        
        if (showToUser && window.app) {
            let message = 'Ha ocurrido un error inesperado';
            
            if (error.message) {
                message = error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            
            app.showNotification(message, 'error');
        }
    }

    // File utilities
    static downloadJSON(data, filename = 'data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static readJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    resolve(json);
                } catch (error) {
                    reject(new Error('Archivo JSON inválido'));
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    // Random utilities
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static generateColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Device detection
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    static isDesktop() {
        return window.innerWidth > 1024;
    }
}

// Make Utils available globally
window.Utils = Utils;
