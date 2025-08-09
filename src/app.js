// Password Generator Application
class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.createParticles();
        this.loadHistory();
        this.hideLoadingScreen();
    }

// DOM Elements
    initializeElements() {
        this.elements = {
            // Forms and inputs
            form: document.getElementById('passwordForm'),
            passwordName: document.getElementById('passwordName'),
            difficulty: document.getElementById('difficulty'),
            length: document.getElementById('length'),
            lengthValue: document.getElementById('lengthValue'),
            strengthIndicator: document.getElementById('strengthIndicator'),
            
            // Checkboxes
            uppercase: document.getElementById('uppercase'),
            lowercase: document.getElementById('lowercase'),
            numbers: document.getElementById('numbers'),
            symbols: document.getElementById('symbols'),
            
            // Buttons
            generateBtn: document.getElementById('generateBtn'),
            btnText: document.getElementById('btnText'),
            btnLoader: document.getElementById('btnLoader'),
            historyBtn: document.getElementById('historyBtn'),
            
            // Modals
            passwordModal: document.getElementById('passwordModal'),
            historyModal: document.getElementById('historyModal'),
            loadingScreen: document.getElementById('loadingScreen'),
            
            // Modal elements
            generatedPassword: document.getElementById('generatedPassword'),
            copyBtn: document.getElementById('copyBtn'),
            regenerateBtn: document.getElementById('regenerateBtn'),
            saveBtn: document.getElementById('saveBtn'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn'),
            
            // History
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            
            // Toast
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            
            // Background
            particles: document.getElementById('particles')
        };
    }

    // Character sets for password generation
    charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePassword();
        });

        // Length slider
        this.elements.length.addEventListener('input', (e) => {
            this.updateLengthDisplay(e.target.value);
            this.updateStrengthIndicator();
        });

        // Difficulty change
        this.elements.difficulty.addEventListener('change', (e) => {
            this.updateFormBasedOnDifficulty(e.target.value);
        });

        // Character options
        [this.elements.uppercase, this.elements.lowercase, this.elements.numbers, this.elements.symbols]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateStrengthIndicator());
            });

        // Advanced toggle (if exists)
        const advancedToggle = document.getElementById('advancedToggle');
        const advancedSection = document.getElementById('advancedSection');
        if (advancedToggle && advancedSection) {
            advancedToggle.addEventListener('click', () => {
                const isHidden = advancedSection.classList.contains('hidden');
                if (isHidden) {
                    advancedSection.classList.remove('hidden');
                } else {
                    advancedSection.classList.add('hidden');
                }
            });
        }

        // Modal events
        this.elements.closeModalBtn.addEventListener('click', () => this.hidePasswordModal());
        this.elements.closeHistoryBtn.addEventListener('click', () => this.hideHistoryModal());
        this.elements.passwordModal.addEventListener('click', (e) => {
            if (e.target === this.elements.passwordModal) this.hidePasswordModal();
        });
        this.elements.historyModal.addEventListener('click', (e) => {
            if (e.target === this.elements.historyModal) this.hideHistoryModal();
        });

        // Button events
        this.elements.copyBtn.addEventListener('click', () => this.copyPassword());
        this.elements.regenerateBtn.addEventListener('click', () => this.generatePassword());
        this.elements.saveBtn.addEventListener('click', () => this.savePassword());
        this.elements.historyBtn.addEventListener('click', () => this.showHistoryModal());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePasswordModal();
                this.hideHistoryModal();
            }
            if (e.ctrlKey && e.key === 'Enter') {
                this.generatePassword();
            }
        });
    }

    // Create animated particles
    createParticles() {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
        
        const size = Math.random() * 8 + 4;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            animation-delay: ${Math.random() * 5}s;
            animation-duration: ${Math.random() * 10 + 10}s;
        `;

            particle.addEventListener('click', () => {
                particle.classList.add('pop');
                setTimeout(() => {
                    particle.remove();
                this.createParticle();
            }, 500);
        });

        this.elements.particles.appendChild(particle);
    }

    // Update length display
    updateLengthDisplay(length) {
        this.elements.lengthValue.textContent = length;
    }

    // Update strength indicator
    updateStrengthIndicator() {
        const length = parseInt(this.elements.length.value);
        const hasUppercase = this.elements.uppercase.checked;
        const hasLowercase = this.elements.lowercase.checked;
        const hasNumbers = this.elements.numbers.checked;
        const hasSymbols = this.elements.symbols.checked;

        let strength = 0;
        let strengthText = '';
        let strengthColor = '';

        // Calculate strength based on length and character types
        if (length >= 8) strength += 1;
        if (length >= 12) strength += 1;
        if (length >= 16) strength += 1;
        if (hasUppercase) strength += 1;
        if (hasLowercase) strength += 1;
        if (hasNumbers) strength += 1;
        if (hasSymbols) strength += 1;

        // Determine strength level
        if (strength <= 2) {
            strengthText = 'ضعیف';
            strengthColor = 'bg-red-500';
        } else if (strength <= 4) {
            strengthText = 'متوسط';
            strengthColor = 'bg-yellow-500';
        } else if (strength <= 6) {
            strengthText = 'قوی';
            strengthColor = 'bg-green-500';
        } else {
            strengthText = 'خیلی قوی';
            strengthColor = 'bg-blue-500';
        }

        // Update indicator
        const indicator = this.elements.strengthIndicator;
        indicator.innerHTML = `
            <span class="w-2 h-2 ${strengthColor} rounded-full mr-1"></span>
            ${strengthText}
        `;
    }

    // Update form based on difficulty
    updateFormBasedOnDifficulty(difficulty) {
        switch (difficulty) {
            case 'easy':
                this.elements.length.value = 8;
                this.elements.uppercase.checked = false;
                this.elements.lowercase.checked = true;
                this.elements.numbers.checked = true;
                this.elements.symbols.checked = false;
                break;
            case 'medium':
                this.elements.length.value = 12;
                this.elements.uppercase.checked = true;
                this.elements.lowercase.checked = true;
                this.elements.numbers.checked = true;
                this.elements.symbols.checked = false;
                break;
            case 'hard':
                this.elements.length.value = 16;
                this.elements.uppercase.checked = true;
                this.elements.lowercase.checked = true;
                this.elements.numbers.checked = true;
                this.elements.symbols.checked = true;
                break;
            case 'custom':
                // Keep current settings
                break;
        }
        
        this.updateLengthDisplay(this.elements.length.value);
        this.updateStrengthIndicator();
    }

    // Generate password
    generatePassword() {
        try {
            this.showLoading();

            const length = parseInt(this.elements.length.value);
            const options = {
                uppercase: this.elements.uppercase.checked,
                lowercase: this.elements.lowercase.checked,
                numbers: this.elements.numbers.checked,
                symbols: this.elements.symbols.checked
            };

            // Validate inputs
            if (!this.validatePasswordOptions(length, options)) {
                return;
            }

            // Generate password using cryptographically secure random
            const password = this.generateSecurePassword(length, options);
            
            // Show password in modal
            this.showPasswordModal(password);
            
        } catch (error) {
            console.error('Error generating password:', error);
            this.showToast('خطا در تولید رمز عبور', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Validate password options
    validatePasswordOptions(length, options) {
        if (length < 4 || length > 50) {
            this.showToast('طول پسورد باید بین 4 تا 50 کاراکتر باشد', 'error');
            return false;
        }

        if (!Object.values(options).some(Boolean)) {
            this.showToast('لطفاً حداقل یک نوع کاراکتر را انتخاب کنید', 'error');
            return false;
        }

        return true;
    }

    // Generate cryptographically secure password
    generateSecurePassword(length, options) {
        let chars = '';
        for (const [key, value] of Object.entries(options)) {
            if (value) chars += this.charSets[key];
        }

        // Use crypto.getRandomValues for better security
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        return password;
    }

    // Show password modal
    showPasswordModal(password) {
        this.elements.generatedPassword.value = password;
        this.updatePasswordStrength(password);
        this.elements.passwordModal.classList.remove('hidden');
        this.elements.passwordModal.classList.add('modal-enter');
    }

    // Hide password modal
    hidePasswordModal() {
        this.elements.passwordModal.classList.add('hidden');
        this.elements.passwordModal.classList.remove('modal-enter');
    }

    // Update password strength display
    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const strengthElement = document.getElementById('passwordStrength');
        const strengthBar = document.getElementById('passwordStrengthBar');

        let strengthText = '';
        let strengthColor = '';
        let strengthWidth = '';

        if (strength <= 2) {
            strengthText = 'ضعیف';
            strengthColor = 'bg-red-500';
            strengthWidth = '25%';
        } else if (strength <= 4) {
            strengthText = 'متوسط';
            strengthColor = 'bg-yellow-500';
            strengthWidth = '50%';
        } else if (strength <= 6) {
            strengthText = 'قوی';
            strengthColor = 'bg-green-500';
            strengthWidth = '75%';
        } else {
            strengthText = 'خیلی قوی';
            strengthColor = 'bg-blue-500';
            strengthWidth = '100%';
        }

        strengthElement.textContent = strengthText;
        strengthBar.className = `h-2 rounded-full ${strengthColor} transition-all duration-300`;
        strengthBar.style.width = strengthWidth;
    }

    // Calculate password strength
    calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (password.length >= 16) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return strength;
    }

    // Copy password to clipboard
    async copyPassword() {
        try {
            const password = this.elements.generatedPassword.value;
            await navigator.clipboard.writeText(password);
            this.showToast('رمز عبور کپی شد!', 'success');
        } catch (error) {
            console.error('Error copying password:', error);
            this.showToast('خطا در کپی کردن رمز عبور', 'error');
        }
    }

    // Save password to history
    async savePassword() {
        try {
            const password = this.elements.generatedPassword.value;
            const name = this.elements.passwordName.value.trim() || 'رمز شما';
            
            // Hash password for storage
            const hashedPassword = await this.hashPassword(password);
            
            const passwordEntry = {
                id: this.generateId(),
                name: this.sanitizeInput(name),
                password: password,
                hashedPassword: hashedPassword,
                timestamp: new Date().toLocaleString('fa-IR'),
                strength: this.calculatePasswordStrength(password)
            };

            this.saveToHistory(passwordEntry);
            this.hidePasswordModal();
            this.showToast('رمز عبور ذخیره شد!', 'success');
            
        } catch (error) {
            console.error('Error saving password:', error);
            this.showToast('خطا در ذخیره کردن رمز عبور', 'error');
        }
    }

    // Hash password using SHA-256
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sanitize input
    sanitizeInput(input) {
        return input.replace(/[<>]/g, '').substring(0, 50);
    }

    // Save to history
    saveToHistory(entry) {
        const history = this.getHistory();
        history.unshift(entry); // Add to beginning
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    // Get history from localStorage
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        } catch (error) {
            console.error('Error parsing history:', error);
            return [];
        }
    }

    // Update history display
    updateHistoryDisplay() {
        const history = this.getHistory();
        const historyList = this.elements.historyList;
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    <p>تاریخچه‌ای موجود نیست</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(entry => `
            <div class="bg-white/5 rounded-lg p-4 border border-white/10" data-entry-id="${entry.id}">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-medium text-white">${entry.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full ${this.getStrengthColor(entry.strength)}">
                            ${this.getStrengthText(entry.strength)}
                        </span>
                        <button class="copy-history-btn text-blue-400 hover:text-blue-300 transition-colors" data-entry-id="${entry.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button class="delete-history-btn text-red-400 hover:text-red-300 transition-colors" data-entry-id="${entry.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="bg-white/10 rounded p-2 mb-2">
                    <code class="text-sm text-white font-mono break-all">${entry.password}</code>
                </div>
                <div class="text-xs text-gray-400">${entry.timestamp}</div>
            </div>
        `).join('');

        // Add event listeners to the newly created buttons
        this.addHistoryEventListeners();
    }

    // Get strength color
    getStrengthColor(strength) {
        if (strength <= 2) return 'bg-red-900/50 text-red-200';
        if (strength <= 4) return 'bg-yellow-900/50 text-yellow-200';
        if (strength <= 6) return 'bg-green-900/50 text-green-200';
        return 'bg-blue-900/50 text-blue-200';
    }

    // Get strength text
    getStrengthText(strength) {
        if (strength <= 2) return 'ضعیف';
        if (strength <= 4) return 'متوسط';
        if (strength <= 6) return 'قوی';
        return 'خیلی قوی';
    }

    // Copy history password
    async copyHistoryPassword(id) {
        try {
            const history = this.getHistory();
            const entry = history.find(item => item.id === id);
            if (entry) {
                await navigator.clipboard.writeText(entry.password);
                this.showToast('رمز عبور کپی شد!', 'success');
            }
        } catch (error) {
            console.error('Error copying history password:', error);
            this.showToast('خطا در کپی کردن رمز عبور', 'error');
        }
    }

    // Add event listeners to history buttons
    addHistoryEventListeners() {
        // Copy buttons
        const copyButtons = document.querySelectorAll('.copy-history-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const entryId = button.getAttribute('data-entry-id');
                this.copyHistoryPassword(entryId);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-history-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const entryId = button.getAttribute('data-entry-id');
                this.deleteHistoryPassword(entryId);
            });
        });
    }

    // Delete history password
    deleteHistoryPassword(id) {
        try {
            const history = this.getHistory();
            const filteredHistory = history.filter(item => item.id !== id);
            localStorage.setItem('passwordHistory', JSON.stringify(filteredHistory));
            this.updateHistoryDisplay();
            this.showToast('رمز عبور حذف شد!', 'success');
        } catch (error) {
            console.error('Error deleting history password:', error);
            this.showToast('خطا در حذف رمز عبور', 'error');
        }
    }

    // Show history modal
    showHistoryModal() {
        this.updateHistoryDisplay();
        this.elements.historyModal.classList.remove('hidden');
        this.elements.historyModal.classList.add('modal-enter');
    }

    // Hide history modal
    hideHistoryModal() {
        this.elements.historyModal.classList.add('hidden');
        this.elements.historyModal.classList.remove('modal-enter');
    }

    // Clear history
    clearHistory() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟')) {
            localStorage.removeItem('passwordHistory');
            this.updateHistoryDisplay();
            this.hideHistoryModal();
            this.showToast('تاریخچه پاک شد!', 'success');
        }
    }

    // Load history on startup
    loadHistory() {
        this.updateHistoryDisplay();
    }

    // Show loading state
    showLoading() {
        this.elements.btnText.classList.add('hidden');
        this.elements.btnLoader.classList.remove('hidden');
        this.elements.generateBtn.disabled = true;
    }

    // Hide loading state
    hideLoading() {
        this.elements.btnText.classList.remove('hidden');
        this.elements.btnLoader.classList.add('hidden');
        this.elements.generateBtn.disabled = false;
    }

    // Hide loading screen
    hideLoadingScreen() {
        setTimeout(() => {
            this.elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        const toastMessage = this.elements.toastMessage;
        
        toastMessage.textContent = message;
        
        // Update toast color based on type
        const toastContent = toast.querySelector('div');
        if (type === 'error') {
            toastContent.className = 'bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
        } else {
            toastContent.className = 'bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
        }
        
        toast.classList.remove('hidden');
        toast.classList.add('toast-enter');
        
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                toast.classList.add('hidden');
                toast.classList.remove('toast-enter', 'toast-exit');
            }, 300);
        }, 3000);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.passwordGenerator = new PasswordGenerator();
});

// Service Worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
}