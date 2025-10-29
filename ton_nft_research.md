# Ricerca TON NFT - Informazioni Chiave

## Architettura NFT su TON

### Differenza con Ethereum

Su TON, a differenza di Ethereum, non esiste un singolo contratto che gestisce tutti gli NFT di una collection. Invece:

1. **NFT Collection Contract**: Un contratto master che contiene:
   - Metadata della collection
   - Indirizzo del proprietario
   - Logica per mintare nuovi NFT

2. **NFT Item Contracts**: Ogni NFT è un contratto separato deployato dalla collection

### Vantaggi dell'architettura TON

- **Gas deterministico**: Nessun uso di dictionary, quindi costi prevedibili
- **Scalabilità**: Ogni NFT è un contratto separato, permettendo sharding
- **Asincronicità**: Compatibile con la natura asincrona di TON

## Standard NFT TON

### TEP-62: Standard NFT Base
- Definisce interfacce per NFT Collection e NFT Item
- Gestione ownership e trasferimenti
- Metadata on-chain e off-chain

### TEP-64: NFT Data Standard
- Formato metadata JSON
- Schema per immagini, descrizioni, attributi
- Compatibilità con marketplace

## Processo di Minting

### 1. Deploy Collection Contract
```typescript
// Wallet apre collection contract
const collection = client.open(NftCollection.createFromConfig(...));

// Deploy collection
await collection.sendDeploy(wallet, toNano("0.05"));
```

### 2. Mint NFT Item
```typescript
// Invia messaggio alla collection per mintare
await collection.sendMintNft(wallet, {
  value: toNano("0.05"),
  queryId: 0,
  itemIndex: 0,
  itemOwnerAddress: ownerAddress,
  itemContent: encodeOffChainContent(metadataUri)
});
```

### 3. Metadata Storage
- **IPFS**: Storage decentralizzato (Pinata, NFT.Storage)
- **Off-chain content**: URI che punta a JSON metadata
- **On-chain content**: Dati direttamente nel contratto (costoso)

## Librerie Necessarie

### TON SDK
```bash
npm install @ton/ton @ton/crypto @ton/core
```

### Funzionalità
- `@ton/ton`: Client per interagire con blockchain
- `@ton/crypto`: Gestione chiavi e firme
- `@ton/core`: Tipi e utilities per celle e messaggi

## Smart Contract Template

I contratti NFT standard sono disponibili in:
- Repository ufficiale TON: `ton-blockchain/token-contract`
- Template FunC per Collection e Item

## Metadata JSON Schema

```json
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "ipfs://...",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ]
}
```

## Gas Costs Stimati

- Deploy Collection: ~0.05 TON
- Mint NFT Item: ~0.05 TON per item
- Transfer NFT: ~0.01 TON

## Marketplace Integration

Per vendere NFT:
1. Deploy Sale Contract (getgems-io/nft-contracts)
2. Transfer NFT al sale contract
3. Buyer invia TON al sale contract
4. Sale contract trasferisce NFT al buyer

## Note Importanti

- Usare testnet per sviluppo (@testgiver_ton_bot per testnet TON)
- Seqno: Counter per prevenire replay attacks
- Ogni transazione deve attendere incremento seqno
- Metadata su IPFS garantisce immutabilità
