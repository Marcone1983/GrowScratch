/**
 * GrowScratch NFT - Utility Functions
 * Production-ready utility functions
 */

const Utils = {
    /**
     * Logger with different levels
     */
    logger: {
        debug(...args) {
            if (CONFIG.ENABLE_LOGGING && ['debug'].includes(CONFIG.LOG_LEVEL)) {
                console.log('[DEBUG]', ...args);
            }
        },
        info(...args) {
            if (CONFIG.ENABLE_LOGGING && ['debug', 'info'].includes(CONFIG.LOG_LEVEL)) {
                console.log('[INFO]', ...args);
            }
        },
        warn(...args) {
            if (CONFIG.ENABLE_LOGGING && ['debug', 'info', 'warn'].includes(CONFIG.LOG_LEVEL)) {
                console.warn('[WARN]', ...args);
            }
        },
        error(...args) {
            if (CONFIG.ENABLE_LOGGING) {
                console.error('[ERROR]', ...args);
            }
        }
    },

    /**
     * Retry function with exponential backoff
     */
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                const delay = baseDelay * Math.pow(2, i);
                this.logger.warn(`Retry attempt ${i + 1} after ${delay}ms`, error);
                await this.sleep(delay);
            }
        }
    },

    /**
     * Sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Generate UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Format TON amount from nanotons
     */
    formatTON(nanotons) {
        return (parseInt(nanotons) / 1000000000).toFixed(2) + ' TON';
    },

    /**
     * Parse TON amount to nanotons
     */
    toNano(amount) {
        return (parseFloat(amount) * 1000000000).toString();
    },

    /**
     * Shorten address for display
     */
    shortenAddress(address, startChars = 6, endChars = 4) {
        if (!address) return '';
        if (address.length <= startChars + endChars) return address;
        return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            this.logger.error('Failed to copy to clipboard:', error);
            return false;
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#F44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideUp 0.3s ease-out;
            font-size: 14px;
            max-width: 90%;
            text-align: center;
        `;

        document.body.appendChild(toast);

        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Validate Telegram initData
     */
    validateInitData(initData) {
        try {
            const urlParams = new URLSearchParams(initData);
            const hash = urlParams.get('hash');
            
            if (!hash) {
                this.logger.error('No hash in initData');
                return false;
            }

            // Additional validation should be done server-side
            return true;
        } catch (error) {
            this.logger.error('Failed to validate initData:', error);
            return false;
        }
    },

    /**
     * Parse query parameters
     */
    parseQueryParams(url = window.location.href) {
        const params = {};
        const queryString = url.split('?')[1];
        
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }
        
        return params;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if running in Telegram WebApp
     */
    isTelegramWebApp() {
        return typeof window.Telegram !== 'undefined' && 
               typeof window.Telegram.WebApp !== 'undefined';
    },

    /**
     * Format timestamp to readable date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get prize by ID
     */
    getPrizeById(prizeId) {
        return CONFIG.GAME.PRIZES.find(p => p.id === prizeId);
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Check if device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Get touch position
     */
    getTouchPos(canvas, touchEvent) {
        const rect = canvas.getBoundingClientRect();
        const touch = touchEvent.touches[0] || touchEvent.changedTouches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    },

    /**
     * Get mouse position
     */
    getMousePos(canvas, mouseEvent) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    },

    /**
     * Vibrate device (if supported)
     */
    vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    },

    /**
     * Play haptic feedback (Telegram)
     */
    hapticFeedback(type = 'light') {
        if (this.isTelegramWebApp() && window.Telegram.WebApp.HapticFeedback) {
            try {
                if (type === 'light') {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                } else if (type === 'medium') {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                } else if (type === 'heavy') {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
                } else if (type === 'success') {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } else if (type === 'error') {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                } else if (type === 'warning') {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                }
            } catch (error) {
                this.logger.warn('Haptic feedback failed:', error);
            }
        }
    },

    /**
     * Format error message
     */
    formatError(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error.message) {
            return error.message;
        }
        return 'Si è verificato un errore sconosciuto';
    },

    /**
     * Local storage wrapper with error handling
     */
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                Utils.logger.error('Failed to set localStorage:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                Utils.logger.error('Failed to get localStorage:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                Utils.logger.error('Failed to remove localStorage:', error);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                Utils.logger.error('Failed to clear localStorage:', error);
                return false;
            }
        }
    }
};

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
`;
document.head.appendChild(style);
