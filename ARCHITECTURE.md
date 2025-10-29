# Architettura Production-Ready - GrowScratch NFT

## Data Progettazione
29 Ottobre 2025

---

## 1. Overview Sistema

**GrowScratch** è una Telegram Mini App che permette agli utenti di giocare a un gratta e vinci digitale, vincere premi NFT e riceverli direttamente nel proprio wallet TON.

### Flusso Utente Completo

1. **Apertura Mini App** → Splash screen con logo GrowScratch
2. **Pagamento 25 Stars** → Acquisto giocata via Telegram Stars
3. **Gioco Scratch Card** → Interazione canvas HTML5 per grattare
4. **Rivelazione Risultato** → Vincita o perdita (randomness server-side)
5. **Connessione Wallet** (se vinto) → TonConnect per collegare wallet TON
6. **Pagamento 1 TON** → Transazione on-chain per mintare NFT
7. **Minting NFT** → Smart contract minta NFT e lo invia al wallet
8. **Conferma** → Utente vede NFT nel proprio wallet

---

## 2. Architettura Tecnica

### Stack Tecnologico

#### Frontend (Telegram Mini App)
- **Framework**: Vanilla JavaScript + HTML5 Canvas
- **UI Library**: CSS3 custom (mobile-first)
- **Telegram SDK**: `telegram-web-app.js`
- **TON SDK**: `@tonconnect/ui` (vanilla JS version)
- **Hosting**: GitHub Pages (static hosting)

#### Backend (Serverless)
- **Platform**: Cloudflare Workers / Vercel Edge Functions
- **Runtime**: Node.js 20+
- **Framework**: Hono.js (lightweight web framework)
- **Database**: Cloudflare D1 / Vercel Postgres
- **Bot API**: `node-telegram-bot-api`

#### Smart Contract (TON Blockchain)
- **Language**: FunC
- **Standard**: TEP-62 (NFT Collection) + TEP-64 (NFT Item)
- **Network**: TON Mainnet
- **Deployment**: Via TON SDK + Blueprint

#### Storage
- **Metadata**: IPFS (Pinata)
- **Images**: IPFS (Pinata)
- **User State**: Telegram Cloud Storage + Database backup
- **Payment Records**: Database (compliance)

---

## 3. Componenti Architetturali

### 3.1 Frontend - Telegram Mini App

#### Struttura File
```
/
├── index.html              # Entry point
├── manifest.json           # TON Connect manifest
├── assets/
│   ├── logo.png           # Logo GrowScratch (1000216417.png)
│   ├── scratch-card.jpg   # Immagine scratch (1000214841.jpg)
│   └── scratch-overlay.png # Overlay grattabile
├── js/
│   ├── app.js             # Main application logic
│   ├── telegram.js        # Telegram SDK wrapper
│   ├── tonconnect.js      # TonConnect integration
│   ├── scratch.js         # Canvas scratch card logic
│   ├── payment.js         # Payment flow management
│   └── utils.js           # Utility functions
└── css/
    └── styles.css         # Responsive styles
```

#### Responsabilità Frontend
1. **UI/UX**: Interfaccia utente responsive e intuitiva
2. **Scratch Card**: Canvas HTML5 con interazione touch/mouse
3. **Telegram Integration**: Gestione WebApp SDK e Cloud Storage
4. **TonConnect**: Connessione wallet e invio transazioni
5. **State Management**: Gestione stati applicazione (idle, playing, won, minting)
6. **Error Handling**: Gestione errori e retry logic

### 3.2 Backend - Serverless API

#### Endpoints

##### POST /api/create-invoice
Crea invoice Telegram Stars per giocata
```typescript
Request:
{
  userId: number,
  initData: string // Telegram WebApp initData
}

Response:
{
  success: boolean,
  invoiceUrl?: string,
  error?: string
}
```

##### POST /api/verify-payment
Verifica pagamento Stars completato
```typescript
Request:
{
  userId: number,
  paymentChargeId: string
}

Response:
{
  verified: boolean,
  gameId?: string
}
```

##### POST /api/generate-result
Genera risultato gioco (server-side randomness)
```typescript
Request:
{
  userId: number,
  gameId: string
}

Response:
{
  won: boolean,
  prizeId?: number, // 1-9
  prizeName?: string,
  prizeImage?: string
}
```

##### POST /api/verify-ton-payment
Verifica pagamento 1 TON on-chain
```typescript
Request:
{
  userId: number,
  transactionHash: string,
  walletAddress: string
}

Response:
{
  verified: boolean,
  amount: string,
  valid: boolean
}
```

##### POST /api/mint-nft
Trigger minting NFT (chiamata smart contract)
```typescript
Request:
{
  userId: number,
  prizeId: number,
  walletAddress: string,
  gameId: string
}

Response:
{
  success: boolean,
  nftAddress?: string,
  transactionHash?: string,
  error?: string
}
```

##### POST /telegram-webhook
Webhook per updates Telegram Bot API
```typescript
Handles:
- pre_checkout_query (validazione pagamento Stars)
- successful_payment (conferma pagamento Stars)
```

#### Responsabilità Backend
1. **Payment Validation**: Verifica pagamenti Stars e TON
2. **Randomness**: Generazione risultati gioco sicuri
3. **Database**: Persistenza dati utenti e pagamenti
4. **Smart Contract Interaction**: Chiamate per minting NFT
5. **Telegram Bot**: Gestione webhook e invio messaggi
6. **Security**: Validazione initData, rate limiting, anti-fraud

### 3.3 Smart Contract - TON Blockchain

#### NFT Collection Contract

**Indirizzo**: `EQ...` (da deployare)

**Funzionalità**:
- Mint NFT items
- Gestione ownership collection
- Royalties configuration
- Metadata collection

**Metodi**:
```func
mint_nft(
  item_index: int,
  item_owner_address: MsgAddress,
  item_content: Cell,
  amount: Coins
) -> ()
```

#### NFT Item Contract

**Standard**: TEP-62

**Metadata Schema**:
```json
{
  "name": "GrowScratch Prize #1",
  "description": "Legendary NFT won in GrowScratch game",
  "image": "ipfs://QmXXX.../prize-1.png",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Prize ID",
      "value": "1"
    },
    {
      "trait_type": "Game Date",
      "value": "2025-10-29"
    }
  ]
}
```

**Funzionalità**:
- Transfer NFT
- Get owner
- Get metadata

#### Deployment Strategy
1. Deploy Collection contract su testnet
2. Test minting e transfer
3. Upload metadata su IPFS
4. Deploy su mainnet
5. Verify contract su TON Explorer

### 3.4 Database Schema

#### Table: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: games
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY, -- UUID
  user_id BIGINT NOT NULL,
  stars_payment_charge_id TEXT UNIQUE,
  stars_paid_at TIMESTAMP,
  result TEXT, -- 'WIN' | 'LOSE'
  prize_id INTEGER,
  ton_payment_hash TEXT,
  ton_paid_at TIMESTAMP,
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_address TEXT,
  nft_minted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id)
);
```

#### Table: payments
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id BIGINT NOT NULL,
  game_id TEXT,
  type TEXT NOT NULL, -- 'STARS' | 'TON'
  amount TEXT NOT NULL,
  charge_id TEXT UNIQUE,
  transaction_hash TEXT,
  status TEXT NOT NULL, -- 'PENDING' | 'COMPLETED' | 'REFUNDED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

#### Table: nfts
```sql
CREATE TABLE nfts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT UNIQUE NOT NULL,
  prize_id INTEGER NOT NULL,
  owner_wallet TEXT NOT NULL,
  nft_address TEXT UNIQUE,
  metadata_uri TEXT NOT NULL,
  minted_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

---

## 4. Flussi di Dati Dettagliati

### 4.1 Flusso Pagamento Stars

```
1. User clicks "Gioca" in Mini App
   ↓
2. Frontend → POST /api/create-invoice
   ↓
3. Backend validates initData
   ↓
4. Backend → Telegram Bot API: sendInvoice
   ↓
5. User receives invoice in Telegram
   ↓
6. User pays with Stars
   ↓
7. Telegram → Backend webhook: pre_checkout_query
   ↓
8. Backend validates order
   ↓
9. Backend → Telegram: answerPreCheckoutQuery(true)
   ↓
10. Telegram → Backend webhook: successful_payment
    ↓
11. Backend saves payment to DB
    ↓
12. Backend generates game result (random)
    ↓
13. Backend saves game to DB
    ↓
14. Backend → Telegram: sendMessage with result
    ↓
15. Frontend polls /api/verify-payment
    ↓
16. Frontend receives result and updates UI
```

### 4.2 Flusso Minting NFT

```
1. User won game (result = WIN)
   ↓
2. Frontend shows "Connetti Wallet" button
   ↓
3. User clicks button
   ↓
4. Frontend → TonConnect: openModal()
   ↓
5. User selects wallet (Tonkeeper, MyTonWallet, etc.)
   ↓
6. Wallet connects and returns address
   ↓
7. Frontend saves wallet address
   ↓
8. Frontend shows "Paga 1 TON per NFT" button
   ↓
9. User clicks button
   ↓
10. Frontend → TonConnect: sendTransaction({
      to: COLLECTION_ADDRESS,
      amount: toNano("1"),
      payload: ... // mint request
    })
    ↓
11. Wallet shows confirmation
    ↓
12. User confirms transaction
    ↓
13. Transaction sent to TON blockchain
    ↓
14. Frontend waits for confirmation (polling)
    ↓
15. Frontend → POST /api/verify-ton-payment
    ↓
16. Backend queries TON blockchain
    ↓
17. Backend verifies transaction (1 TON to collection)
    ↓
18. Backend → POST /api/mint-nft
    ↓
19. Backend calls smart contract mint method
    ↓
20. Smart contract mints NFT
    ↓
21. Smart contract transfers NFT to user wallet
    ↓
22. Backend saves NFT data to DB
    ↓
23. Backend → Telegram: sendMessage with NFT details
    ↓
24. Frontend shows success + NFT image
```

---

## 5. Security & Anti-Fraud

### 5.1 Validazione Telegram InitData

Ogni richiesta dal frontend deve includere `initData` firmato da Telegram:

```javascript
// Backend validation
function validateInitData(initData: string): boolean {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

### 5.2 Rate Limiting

Prevenire spam e abusi:

```javascript
// Cloudflare Workers KV
const rateLimiter = {
  async check(userId: number): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const count = await KV.get(key);
    
    if (count && parseInt(count) > 10) {
      return false; // Too many requests
    }
    
    await KV.put(key, (parseInt(count || '0') + 1).toString(), {
      expirationTtl: 3600 // 1 hour
    });
    
    return true;
  }
};
```

### 5.3 Idempotency

Prevenire doppi pagamenti:

```javascript
// Check if payment already processed
const existingGame = await db.games.findOne({
  stars_payment_charge_id: chargeId
});

if (existingGame) {
  // Already processed, return existing result
  return existingGame;
}
```

### 5.4 Server-Side Randomness

Risultato gioco generato server-side:

```javascript
// Cryptographically secure random
const crypto = require('crypto');

function generateGameResult(userId: number, gameId: string): GameResult {
  // Use crypto.randomBytes for secure randomness
  const buffer = crypto.randomBytes(4);
  const random = buffer.readUInt32BE(0) / 0xFFFFFFFF;
  
  // 20% win rate
  const won = random < 0.2;
  
  if (won) {
    // Random prize 1-9
    const prizeBuffer = crypto.randomBytes(1);
    const prizeId = (prizeBuffer[0] % 9) + 1;
    
    return {
      won: true,
      prizeId,
      prizeName: PRIZES[prizeId].name,
      prizeImage: PRIZES[prizeId].image
    };
  }
  
  return { won: false };
}
```

### 5.5 TON Payment Verification

Verificare transazione on-chain:

```javascript
async function verifyTonPayment(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<boolean> {
  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC'
  });
  
  const tx = await client.getTransaction(txHash);
  
  // Verify amount
  if (tx.inMessage.value !== expectedAmount) {
    return false;
  }
  
  // Verify recipient
  if (tx.inMessage.destination !== expectedRecipient) {
    return false;
  }
  
  // Verify confirmation
  if (tx.confirmations < 3) {
    return false; // Wait for more confirmations
  }
  
  return true;
}
```

---

## 6. Error Handling & Resilience

### 6.1 Frontend Error States

```javascript
const ERROR_STATES = {
  NETWORK_ERROR: 'Errore di connessione. Riprova.',
  PAYMENT_FAILED: 'Pagamento fallito. Riprova o contatta supporto.',
  WALLET_NOT_CONNECTED: 'Connetti il wallet per continuare.',
  TRANSACTION_REJECTED: 'Transazione rifiutata dal wallet.',
  MINTING_FAILED: 'Errore durante minting NFT. Contatta supporto.',
  INVALID_STATE: 'Stato non valido. Ricarica la pagina.'
};
```

### 6.2 Retry Logic

```javascript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 6.3 Fallback Mechanisms

- **Telegram Cloud Storage**: Backup su database se Cloud Storage fallisce
- **IPFS**: Multiple gateways per metadata (Pinata, Cloudflare, NFT.Storage)
- **TON RPC**: Fallback su multiple endpoints (TonCenter, TON API, GetBlock)

---

## 7. Monitoring & Analytics

### 7.1 Metriche Chiave

- **User Metrics**: DAU, MAU, retention rate
- **Payment Metrics**: Stars revenue, TON revenue, conversion rate
- **Game Metrics**: Win rate, average games per user
- **NFT Metrics**: Minted NFTs, failed mints, mint success rate
- **Performance Metrics**: API latency, error rate, uptime

### 7.2 Logging

```javascript
// Structured logging
logger.info('payment_completed', {
  userId,
  gameId,
  amount: 25,
  currency: 'STARS',
  timestamp: Date.now()
});

logger.error('nft_mint_failed', {
  userId,
  gameId,
  prizeId,
  error: error.message,
  stack: error.stack
});
```

### 7.3 Alerting

- **Critical**: Payment webhook down, smart contract error
- **Warning**: High error rate, slow API response
- **Info**: New user, NFT minted

---

## 8. Deployment Strategy

### 8.1 Environments

#### Development
- **Frontend**: GitHub Pages (dev branch)
- **Backend**: Cloudflare Workers (dev environment)
- **Smart Contract**: TON Testnet
- **Database**: Local SQLite / Cloudflare D1 dev

#### Production
- **Frontend**: GitHub Pages (main branch)
- **Backend**: Cloudflare Workers (production)
- **Smart Contract**: TON Mainnet
- **Database**: Cloudflare D1 / Vercel Postgres

### 8.2 CI/CD Pipeline

```yaml
# GitHub Actions
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Build frontend
      - Deploy to GitHub Pages
  
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Run tests
      - Deploy to Cloudflare Workers
```

### 8.3 Rollback Plan

- **Frontend**: Revert GitHub Pages deploy
- **Backend**: Rollback Cloudflare Workers version
- **Smart Contract**: Deploy new version (immutable, no rollback)
- **Database**: Backup before migrations

---

## 9. Scalability

### 9.1 Horizontal Scaling

- **Frontend**: Static hosting, CDN (GitHub Pages + Cloudflare)
- **Backend**: Serverless auto-scaling (Cloudflare Workers)
- **Database**: Connection pooling, read replicas
- **Smart Contract**: Sharding nativo TON

### 9.2 Caching Strategy

- **Frontend**: Service Worker per assets statici
- **Backend**: Cache risultati gioco (5 min TTL)
- **Metadata**: IPFS caching via gateway
- **TON Data**: Cache blockchain queries (1 min TTL)

### 9.3 Load Testing

Target: 1000 concurrent users, 10000 games/day

- **Stars Payments**: 100 req/s
- **TON Transactions**: 50 tx/s
- **NFT Minting**: 20 mint/s

---

## 10. Compliance & Legal

### 10.1 Telegram Requirements

- ✅ Terms & Conditions (`/terms` command)
- ✅ Support (`/support` command)
- ✅ Payment disputes handling (`/paysupport`)
- ✅ 2FA enabled on bot owner account
- ✅ Only Telegram Stars for digital goods

### 10.2 Data Privacy

- **GDPR Compliance**: User data deletion on request
- **Data Retention**: Payment records 7 years (compliance)
- **Encryption**: TLS 1.3 for all communications
- **PII**: Minimal data collection (only Telegram ID)

### 10.3 Smart Contract Audit

- **Pre-mainnet**: Audit by TON Foundation o terze parti
- **Bug Bounty**: Programma reward per vulnerabilità
- **Insurance**: Considerare insurance per smart contract

---

## 11. Costi Stimati

### 11.1 Infrastructure

| Servizio | Costo Mensile |
|----------|---------------|
| GitHub Pages | $0 (free) |
| Cloudflare Workers | $5 (100k req/day) |
| Cloudflare D1 | $5 (1M rows) |
| Pinata IPFS | $20 (100GB) |
| TON Gas | ~$50 (1000 mints) |
| **TOTALE** | **~$80/mese** |

### 11.2 Revenue Model

- **Stars**: Developer riceve ~65% del valore
  - 25 Stars = ~$0.16 revenue per game
- **TON**: 1 TON per NFT minting
  - 1 TON = ~$2.50 (prezzo variabile)
  - Costo gas minting: ~0.05 TON
  - Net revenue: ~0.95 TON (~$2.38)

**Break-even**: ~50 giocate/mese per coprire costi infrastruttura

---

## 12. Roadmap Implementazione

### Phase 1: MVP (Settimana 1-2)
- ✅ Smart contract NFT Collection
- ✅ Backend API base
- ✅ Frontend Mini App con scratch card
- ✅ Telegram Stars payment
- ✅ TonConnect integration
- ✅ NFT minting manuale

### Phase 2: Production (Settimana 3-4)
- ✅ Database setup e migrations
- ✅ Automated NFT minting
- ✅ Error handling completo
- ✅ Monitoring e logging
- ✅ Testing end-to-end
- ✅ Security audit

### Phase 3: Launch (Settimana 5)
- ✅ Deploy su mainnet
- ✅ Marketing e onboarding
- ✅ User testing
- ✅ Bug fixes
- ✅ Performance optimization

### Phase 4: Iteration (Ongoing)
- Analytics e ottimizzazioni
- Nuovi premi NFT
- Gamification features
- Community building

---

**Architetto**: Manus AI Agent  
**Versione**: 1.0  
**Data**: 29 Ottobre 2025
