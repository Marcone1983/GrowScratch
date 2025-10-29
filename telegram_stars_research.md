# Ricerca Telegram Stars Payment - Informazioni Chiave

## Overview Telegram Stars

**Telegram Stars** è la valuta in-app di Telegram per acquistare beni e servizi digitali. Gli utenti acquistano Stars da Telegram (via Apple/Google in-app purchase o @PremiumBot) e li usano per pagare bot e mini app.

### Prezzi Stars (Developer Proceeds)

| Stars | Prezzo Utente | Developer Riceve |
|-------|---------------|------------------|
| 50    | $0.99         | $0.65            |
| 75    | $1.49         | $0.98            |
| 100   | $1.99         | $1.30            |
| 150   | $2.99         | $1.95            |
| 250   | $4.99         | $3.25            |
| 500   | $9.99         | $6.50            |
| 1000  | $19.99        | $13.00           |
| 2500  | $49.99        | $32.50           |

**Note**: Telegram trattiene ~35% (commissioni Apple/Google + costi amministrativi)

## Implementazione Bot API

### Flusso Completo

#### 1. Creare Invoice
```javascript
// Metodo: sendInvoice
const invoice = {
  chat_id: userId,
  title: "Gratta e Vinci GrowScratch",
  description: "Gioca e vinci premi NFT esclusivi!",
  payload: "scratch_game_" + Date.now(), // Unique identifier
  provider_token: "", // VUOTO per digital goods
  currency: "XTR", // Telegram Stars
  prices: [
    { label: "Gioca", amount: 25 } // 25 Stars
  ],
  photo_url: "https://your-app.com/scratch-card.jpg",
  photo_width: 800,
  photo_height: 600
};

await bot.sendInvoice(invoice);
```

#### 2. Pre-Checkout Query
Quando l'utente clicca "Pay", il bot riceve un update `pre_checkout_query`:

```javascript
bot.on('pre_checkout_query', async (query) => {
  // IMPORTANTE: Rispondere entro 10 secondi!
  
  // Validazione ordine (es: check disponibilità)
  const canProcess = await validateOrder(query.invoice_payload);
  
  if (canProcess) {
    // Approva pagamento
    await bot.answerPreCheckoutQuery(query.id, true);
  } else {
    // Rifiuta con messaggio
    await bot.answerPreCheckoutQuery(
      query.id, 
      false, 
      { error_message: "Spiacenti, servizio temporaneamente non disponibile!" }
    );
  }
});
```

**CRITICO**: Rispondere entro 10 secondi o la transazione viene cancellata automaticamente.

#### 3. Successful Payment
Dopo pagamento completato, il bot riceve `successful_payment`:

```javascript
bot.on('message', async (msg) => {
  if (msg.successful_payment) {
    const payment = msg.successful_payment;
    
    // Dati disponibili:
    // - payment.currency: "XTR"
    // - payment.total_amount: 25
    // - payment.invoice_payload: "scratch_game_..."
    // - payment.telegram_payment_charge_id: "unique_charge_id"
    
    // SALVARE telegram_payment_charge_id per eventuali refund!
    await savePayment({
      userId: msg.from.id,
      chargeId: payment.telegram_payment_charge_id,
      amount: payment.total_amount,
      payload: payment.invoice_payload
    });
    
    // SOLO DOPO questo update, consegnare il servizio
    await deliverService(msg.from.id);
  }
});
```

**WARNING**: NON consegnare servizi basandosi solo su `pre_checkout_query`. Solo `successful_payment` garantisce pagamento completato.

## Telegram Mini App Integration

### Invio Invoice da Mini App

#### Opzione A: Via Bot Backend
Il Mini App chiama il bot backend che invia invoice:

```javascript
// Frontend Mini App
async function requestGame() {
  const initData = window.Telegram.WebApp.initData;
  
  // Chiamata al backend
  const response = await fetch('/api/create-invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData
    },
    body: JSON.stringify({ 
      product: 'scratch_game',
      amount: 25 
    })
  });
  
  // Backend invia invoice via Bot API
  // Utente riceve notifica in Telegram
}
```

#### Opzione B: Web App Invoice Link
Creare link invoice che apre pagamento in Telegram:

```javascript
// Backend genera invoice link
const invoiceLink = await bot.createInvoiceLink({
  title: "Gratta e Vinci",
  description: "Gioca e vinci!",
  payload: "scratch_" + userId,
  provider_token: "",
  currency: "XTR",
  prices: [{ label: "Gioca", amount: 25 }]
});

// Frontend apre link
window.Telegram.WebApp.openInvoice(invoiceLink, (status) => {
  if (status === 'paid') {
    // Pagamento completato
    // Verificare con backend prima di procedere
    checkPaymentStatus();
  }
});
```

## Validazione Server-Side

### Webhook Setup
Configurare webhook per ricevere updates in tempo reale:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-backend.com/telegram-webhook"}'
```

### Endpoint Webhook
```javascript
// Express.js example
app.post('/telegram-webhook', async (req, res) => {
  const update = req.body;
  
  // Pre-checkout query
  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;
    
    // Validazione server-side
    const isValid = await validatePayment(query);
    
    await bot.answerPreCheckoutQuery(query.id, isValid);
  }
  
  // Successful payment
  if (update.message?.successful_payment) {
    const payment = update.message.successful_payment;
    
    // Salvare in database
    await db.payments.create({
      userId: update.message.from.id,
      chargeId: payment.telegram_payment_charge_id,
      amount: payment.total_amount,
      payload: payment.invoice_payload,
      timestamp: new Date()
    });
    
    // Consegnare servizio
    await deliverDigitalGood(update.message.from.id, payment.invoice_payload);
  }
  
  res.sendStatus(200);
});
```

## Refund API

Per rimborsare pagamenti:

```javascript
await bot.refundStarPayment(
  userId,
  telegram_payment_charge_id
);
```

## Security Best Practices

### 1. Payload Validation
Usare payload univoci e verificabili:
```javascript
const payload = crypto.createHmac('sha256', SECRET_KEY)
  .update(`${userId}_${timestamp}_${productId}`)
  .digest('hex');
```

### 2. Idempotency
Prevenire doppi pagamenti:
```javascript
// Check se payload già processato
const existingPayment = await db.payments.findOne({ 
  payload: payment.invoice_payload 
});

if (existingPayment) {
  // Già processato, non consegnare di nuovo
  return;
}
```

### 3. Timeout Handling
Pre-checkout query ha timeout di 10 secondi:
```javascript
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 9000)
);

const validation = validateOrder(query);

try {
  const result = await Promise.race([validation, timeout]);
  await bot.answerPreCheckoutQuery(query.id, result);
} catch (error) {
  // Fallback: rifiuta se timeout
  await bot.answerPreCheckoutQuery(query.id, false);
}
```

## Testing

### Test Environment
Telegram fornisce ambiente di test per Stars:

1. Connettere bot a test environment
2. Usare test Telegram app
3. Stars gratuiti per testing
4. Nessun pagamento reale

Documentazione: https://core.telegram.org/bots/webapps#testing-mini-apps

## Compliance

### Obbligatorio per Digital Goods
- **SOLO Telegram Stars** per beni digitali in Telegram
- Nessun altro payment provider consentito
- Nessuna criptovaluta alternativa
- Compliance con Apple App Store e Google Play Store

### Bot Requirements
Il bot DEVE:
1. Rispondere a `/terms` con Terms & Conditions
2. Rispondere a `/support` o `/paysupport` per supporto
3. Processare dispute e refund tempestivamente
4. Avere 2FA abilitato sull'account proprietario

## Note Importanti

### Multi-Use Invoices
Invoice possono essere:
- **Single-use**: Pagabile solo una volta
- **Multi-use**: Pagabile più volte (inline mode, gruppi)

Controllare in `pre_checkout_query` se accettare pagamenti multipli.

### Forwarding
Invoice inoltrati possono mantenere Pay button (multi-chat) o mostrare deep link (single-chat).

### Receipt
Dopo pagamento, utente vede Receipt in chat con tutti i dettagli della transazione.

### Stars Balance
Developer può convertire Stars in reward o usarli per Telegram Ads.

## Esempio Completo: GrowScratch

```javascript
// 1. Utente apre Mini App e clicca "Gioca"
// Frontend chiama backend

// 2. Backend crea invoice
const invoice = await bot.sendInvoice({
  chat_id: userId,
  title: "GrowScratch - Gioca",
  description: "Gratta e vinci premi NFT!",
  payload: `scratch_${userId}_${Date.now()}`,
  provider_token: "",
  currency: "XTR",
  prices: [{ label: "Gioca", amount: 25 }],
  photo_url: "https://growscratch.com/card.jpg"
});

// 3. Utente paga in Telegram
// Bot riceve pre_checkout_query

bot.on('pre_checkout_query', async (query) => {
  // Validazione rapida
  await bot.answerPreCheckoutQuery(query.id, true);
});

// 4. Pagamento completato
// Bot riceve successful_payment

bot.on('message', async (msg) => {
  if (msg.successful_payment) {
    // Salvare payment
    await savePayment(msg.successful_payment);
    
    // Generare risultato gioco (server-side random)
    const result = await generateGameResult(msg.from.id);
    
    // Notificare utente
    await bot.sendMessage(msg.from.id, 
      result.won ? "🎉 HAI VINTO!" : "😢 Riprova!"
    );
    
    // Se vinto, abilitare prossimo step (pagamento TON per NFT)
    if (result.won) {
      await enableNFTMinting(msg.from.id, result.prizeId);
    }
  }
});
```
