# Ricerca TonConnect - Informazioni Chiave

## TonConnect UI React SDK

### Installazione
```bash
npm i @tonconnect/ui-react
```

### Setup Base

#### 1. Creare Manifest
File `tonconnect-manifest.json` da hostare pubblicamente:
```json
{
  "url": "https://your-app.com",
  "name": "GrowScratch NFT",
  "iconUrl": "https://your-app.com/logo.png",
  "termsOfUseUrl": "https://your-app.com/terms",
  "privacyPolicyUrl": "https://your-app.com/privacy"
}
```

#### 2. Provider Setup
```tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function App() {
  return (
    <TonConnectUIProvider 
      manifestUrl="https://your-app.com/tonconnect-manifest.json"
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/YOUR_APP_NAME'
      }}
    >
      {/* Your app */}
    </TonConnectUIProvider>
  );
}
```

#### 3. Connect Button
```tsx
import { TonConnectButton } from '@tonconnect/ui-react';

export const Header = () => {
  return (
    <header>
      <TonConnectButton />
    </header>
  );
};
```

## Hooks Principali

### useTonAddress
Ottiene l'indirizzo wallet dell'utente:
```tsx
import { useTonAddress } from '@tonconnect/ui-react';

const userFriendlyAddress = useTonAddress(); // UQ...
const rawAddress = useTonAddress(false); // 0:...
```

### useTonWallet
Ottiene informazioni complete sul wallet:
```tsx
import { useTonWallet } from '@tonconnect/ui-react';

const wallet = useTonWallet();
// wallet.account.address
// wallet.device.appName
// wallet.provider
```

### useTonConnectUI
Accesso completo all'istanza TonConnect:
```tsx
import { useTonConnectUI } from '@tonconnect/ui-react';

const [tonConnectUI, setOptions] = useTonConnectUI();

// Aprire modal manualmente
tonConnectUI.openModal();

// Inviare transazioni
tonConnectUI.sendTransaction(transaction);

// Disconnettere wallet
tonConnectUI.disconnect();
```

### useIsConnectionRestored
Verifica se la connessione è stata ripristinata:
```tsx
import { useIsConnectionRestored } from '@tonconnect/ui-react';

const connectionRestored = useIsConnectionRestored();
if (!connectionRestored) {
  return <Loader />;
}
```

## Invio Transazioni

### Struttura Transazione
```tsx
const transaction: SendTransactionRequest = {
  validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minuti
  messages: [
    {
      address: "UQ...", // Indirizzo destinatario
      amount: "1000000000", // 1 TON in nanotons
      payload: "te6cc..." // Optional: BOC-encoded payload
    }
  ]
};

await tonConnectUI.sendTransaction(transaction);
```

### Payload per Smart Contract
Per chiamare metodi di smart contract:
```tsx
import { beginCell } from '@ton/core';

const payload = beginCell()
  .storeUint(0, 32) // op code
  .storeUint(0, 64) // query id
  .storeAddress(recipientAddress)
  .endCell()
  .toBoc()
  .toString('base64');
```

## TON Proof (Verifica Ownership)

### Setup
```tsx
tonConnectUI.setConnectRequestParameters({ 
  state: "loading" 
});

const tonProofPayload = await fetchTonProofPayload();

tonConnectUI.setConnectRequestParameters({
  state: "ready",
  value: { tonProof: tonProofPayload }
});
```

### Verifica Backend
Il backend deve verificare la firma per confermare ownership dell'indirizzo.

## Integrazione Telegram Mini App

### Return URL
Dopo connessione wallet, redirect a Telegram Mini App:
```tsx
<TonConnectUIProvider
  actionsConfiguration={{
    twaReturnUrl: 'https://t.me/YOUR_BOT/YOUR_APP'
  }}
>
```

### Modal Customization
```tsx
const [tonConnectUI, setOptions] = useTonConnectUI();

setOptions({
  language: 'it',
  uiPreferences: {
    theme: 'DARK'
  }
});
```

## Wallet Supportati

TonConnect supporta automaticamente:
- Tonkeeper
- MyTonWallet
- OpenMask
- Tonhub
- DeWallet
- E altri wallet compatibili

## Note Importanti

### Nanotons
1 TON = 1,000,000,000 nanotons
```tsx
import { toNano } from '@ton/core';
const amount = toNano("1.5"); // "1500000000"
```

### Validità Transazioni
`validUntil` deve essere timestamp futuro (max 5-10 minuti):
```tsx
validUntil: Math.floor(Date.now() / 1000) + 600
```

### Error Handling
```tsx
try {
  const result = await tonConnectUI.sendTransaction(transaction);
  console.log('Transaction sent:', result);
} catch (error) {
  if (error instanceof UserRejectsError) {
    console.log('User rejected transaction');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Vanilla JS (senza React)

Per applicazioni non-React:
```bash
npm i @tonconnect/ui
```

```javascript
import TonConnectUI from '@tonconnect/ui';

const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://your-app.com/tonconnect-manifest.json',
  buttonRootId: 'ton-connect-button'
});

// Connetti wallet
await tonConnectUI.connectWallet();

// Ottieni indirizzo
const address = tonConnectUI.account?.address;

// Invia transazione
await tonConnectUI.sendTransaction(transaction);
```

## Best Practices

1. **Manifest Hosting**: Hostare manifest su HTTPS
2. **Error Handling**: Gestire sempre errori di connessione e transazione
3. **Loading States**: Mostrare loader durante operazioni async
4. **Connection Restore**: Usare `useIsConnectionRestored` per UX migliore
5. **Disconnect**: Fornire opzione per disconnettere wallet
6. **Mobile First**: Testare su mobile (Telegram app)
