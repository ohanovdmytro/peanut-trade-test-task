require("dotenv").config();
const fs = require("fs");

let contractData;

try {
  contractData = JSON.parse(
    fs.readFileSync(
      "artifacts/contracts/VaultTrader.sol/VaultTrader.json",
      "utf8"
    )
  );
} catch (error) {
  if (error.message.includes("ENOENT")) {
  }
}

const config = {
  deploy: {
    uniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    uniswapV3Router: "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  trade: {
    vaultTraderAddress: "0xe7B6E60A6784693AD3F96Beca0e9D1b202950c7d",
    providerUrlWs: `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    tokenIn: `${process.env.TOKEN_IN}`,
    tokenOut: `${process.env.TOKEN_OUT}`,
  },
  hardhat: {
    providerUrlHTTP: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    mnemonic: `${process.env.MNEMONIC}`,
  },
  contract: {
    abi: contractData?.abi,
    bytecode: contractData?.bytecode,
  },
};

module.exports = {
  config,
};
