/**
 * GrowScratch NFT - Configuration
 * Production-ready configuration file
 */

const CONFIG = {
    // API Endpoints
    API: {
        BASE_URL: 'https://your-backend.workers.dev', // TODO: Replace with actual backend URL
        ENDPOINTS: {
            CREATE_INVOICE: '/api/create-invoice',
            VERIFY_PAYMENT: '/api/verify-payment',
            GENERATE_RESULT: '/api/generate-result',
            VERIFY_TON_PAYMENT: '/api/verify-ton-payment',
            MINT_NFT: '/api/mint-nft'
        }
    },

    // TON Blockchain
    TON: {
        NETWORK: 'mainnet', // 'mainnet' | 'testnet'
        COLLECTION_ADDRESS: 'EQ...', // TODO: Replace with deployed NFT collection address
        MINT_AMOUNT: '1000000000', // 1 TON in nanotons
        RPC_ENDPOINT: 'https://toncenter.com/api/v2/jsonRPC',
        EXPLORER_URL: 'https://tonscan.org'
    },

    // TON Connect
    TON_CONNECT: {
        MANIFEST_URL: 'https://marcone1983.github.io/GrowScratch/tonconnect-manifest.json',
        BUTTON_ROOT_ID: 'ton-connect-button'
    },

    // Game Configuration
    GAME: {
        STARS_COST: 25, // Stars required to play
        WIN_RATE: 0.20, // 20% win rate
        SCRATCH_THRESHOLD: 0.70, // 70% must be scratched to reveal
        PRIZES: [
            {
                id: 1,
                name: 'Legendary Dragon NFT',
                rarity: 'Legendary',
                image: 'assets/prizes/prize-1.png'
            },
            {
                id: 2,
                name: 'Epic Phoenix NFT',
                rarity: 'Epic',
                image: 'assets/prizes/prize-2.png'
            },
            {
                id: 3,
                name: 'Rare Unicorn NFT',
                rarity: 'Rare',
                image: 'assets/prizes/prize-3.png'
            },
            {
                id: 4,
                name: 'Uncommon Griffin NFT',
                rarity: 'Uncommon',
                image: 'assets/prizes/prize-4.png'
            },
            {
                id: 5,
                name: 'Common Wolf NFT',
                rarity: 'Common',
                image: 'assets/prizes/prize-5.png'
            },
            {
                id: 6,
                name: 'Legendary Kraken NFT',
                rarity: 'Legendary',
                image: 'assets/prizes/prize-6.png'
            },
            {
                id: 7,
                name: 'Epic Cerberus NFT',
                rarity: 'Epic',
                image: 'assets/prizes/prize-7.png'
            },
            {
                id: 8,
                name: 'Rare Pegasus NFT',
                rarity: 'Rare',
                image: 'assets/prizes/prize-8.png'
            },
            {
                id: 9,
                name: 'Uncommon Hydra NFT',
                rarity: 'Uncommon',
                image: 'assets/prizes/prize-9.png'
            }
        ]
    },

    // UI Configuration
    UI: {
        SPLASH_DURATION: 2000, // 2 seconds
        ANIMATION_DURATION: 300, // 300ms
        TOAST_DURATION: 3000, // 3 seconds
        POLLING_INTERVAL: 2000 // 2 seconds for payment verification
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Errore di connessione. Verifica la tua connessione internet e riprova.',
        PAYMENT_FAILED: 'Pagamento fallito. Riprova o contatta il supporto.',
        WALLET_NOT_CONNECTED: 'Connetti il wallet per continuare.',
        TRANSACTION_REJECTED: 'Transazione rifiutata dal wallet.',
        MINTING_FAILED: 'Errore durante il minting dell\'NFT. Contatta il supporto con il tuo game ID.',
        INVALID_STATE: 'Stato non valido. Ricarica la pagina.',
        TELEGRAM_NOT_AVAILABLE: 'Questa app funziona solo all\'interno di Telegram.',
        INIT_DATA_INVALID: 'Dati di inizializzazione non validi.',
        RATE_LIMIT: 'Troppe richieste. Attendi un momento e riprova.'
    },

    // Success Messages
    SUCCESS: {
        PAYMENT_COMPLETED: 'Pagamento completato con successo!',
        NFT_MINTED: 'NFT mintato e inviato al tuo wallet!',
        WALLET_CONNECTED: 'Wallet connesso con successo!'
    },

    // Development Mode
    DEV_MODE: false, // Set to true for development/testing
    
    // Logging
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'info' // 'debug' | 'info' | 'warn' | 'error'
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.TON);
Object.freeze(CONFIG.TON_CONNECT);
Object.freeze(CONFIG.GAME);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.ERRORS);
Object.freeze(CONFIG.SUCCESS);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
