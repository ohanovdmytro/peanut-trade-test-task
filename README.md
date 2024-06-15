# Vault Trader test task for Peanut Trade

This is a test task for a Node.js developer position in Peanut Trade

In order to run this application - follow the instructions:

## Setup `.env` file as in `.env.example`

```env
ALCHEMY_API_KEY="apikey"

MNEMONIC="your mnemonic phrase"

TOKEN_IN=0xtoken1address
TOKEN_OUT=0xtoken2address
```

## Steps to run

### Option-1: For block-checking swap:

```shell
npm install
npm deploy:mainnet

```

Then, copy a contract address and insert it into `config.js`:

```javascript
const config = {
  //...
  trade: {
    vaultTraderAddress: "your-contract-address",
    //...
  },
  //...
};
```

Then run the script:

```shell
npm run block
```

### Option-2: For timeout swap:

```shell
npm install
npm deploy:mainnet
```

Then, copy a contract address and insert it into `config.js`:

```javascript
const config = {
  //...
  trade: {
    vaultTraderAddress: "your-contract-address",
    //...
  },
  //...
};
```

Then run the script:

```shell
npm run timeout
```

## Testing envirnoment

Setup a local testnet forking the mainnet:

```shell
npm install
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/*your-api-key*
npm deploy:testnet
# ...
```
