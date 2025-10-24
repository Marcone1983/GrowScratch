# GrowScratch - Telegram Mini App (TMA)

Questo repository contiene il codice corretto per la Mini App "GrowScratch" che utilizza esclusivamente il Telegram Mini App SDK (TMA SDK) per la gestione dei pagamenti in Stars e TON, come richiesto.

## Correzione del Bug di Sicurezza

Il bug originale che permetteva agli utenti di "vincere" senza pagare derivava dalla mancanza di una verifica lato server.

**ATTENZIONE:** La soluzione qui implementata è la migliore possibile **senza un backend esterno**, ma **NON ELIMINA COMPLETAMENTE IL RISCHIO DI FRODE**, specialmente per i pagamenti in TON.

### 1. Pagamento Stars (25 Stars) - `webApp.openInvoice()`

*   **Flusso:** Utilizza `webApp.openInvoice()`.
*   **Sicurezza:** Il bot associato alla Mini App **DEVE** essere configurato per ricevere gli aggiornamenti di pagamento via webhook. Il codice frontend si fida del callback `status === 'paid'`, che è manipolabile. Per una sicurezza completa, il tuo bot/server dovrebbe verificare il pagamento con l'API di Telegram prima di autorizzare l'inizio del gioco.

### 2. Pagamento TON (1 TON) - Trasferimento Wallet Pay

*   **Flusso:** Utilizza `webApp.openTelegramLink()` per aprire un link di trasferimento Wallet Pay (il meccanismo più vicino al "solo Telegram" per TON).
*   **Indirizzo Wallet:** `UQArbhbVEIkN4xSWis30yIrNGdmOTBbiMBduGeNTErPbviyR`
*   **Bug Persistente:** `openTelegramLink()` **NON** fornisce un feedback di successo/fallimento. L'utente può annullare la transazione ma l'app, non avendo un backend per la verifica on-chain, assume che il pagamento sia avvenuto per poter procedere. **Questo è il punto debole che permette la frode in assenza di un backend.**

## Istruzioni per il Deploy su GitHub Pages

Segui questi passaggi per deployare la tua Mini App e renderla accessibile via HTTPS.

1.  **Repository:** Il codice è stato caricato nella cartella `src/`.
2.  **Configurazione GitHub Pages:**
    *   Vai alle **Settings** del tuo repository su GitHub.
    *   Clicca su **Pages** nella barra laterale.
    *   Sotto **Build and deployment**, seleziona **Deploy from a branch**.
    *   Seleziona il branch **main** e la cartella `/src` (o `/(root)` se sposti `index.html` nella root).
    *   Clicca **Save**.
3.  **URL della Mini App:** Dopo pochi minuti, la tua Mini App sarà disponibile all'indirizzo: `https://marcone1983.github.io/GrowScratch/`
4.  **Associazione al Bot:**
    *   Vai su **BotFather** su Telegram.
    *   Usa il comando `/mybots` e seleziona il tuo bot.
    *   Vai su **Bot Settings** -> **Mini Apps** -> **Configure Mini App**.
    *   Inserisci l'URL di GitHub Pages sopra (es. `https://marcone1983.github.io/GrowScratch/`).

## Prossimi Passi (Sicurezza)

Per eliminare completamente il rischio di frode, ti consiglio vivamente di:

1.  **Implementare un piccolo backend** (anche con servizi serverless gratuiti) per:
    *   Generare **invoice Stars** in modo sicuro.
    *   Ricevere i **webhook di pagamento Stars** da Telegram.
    *   Integrare un servizio di pagamento TON (es. Wallet Pay o TON Connect) e monitorare la blockchain per la **verifica on-chain** della transazione TON.
2.  **Sostituire** il pagamento in TON con un pagamento in **Stars** anche per il riscatto del premio, se vuoi mantenere la soluzione completamente "backend-free".
