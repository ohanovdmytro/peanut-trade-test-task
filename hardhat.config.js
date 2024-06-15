require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
task("accounts", "Prints the list of accounts", async (hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "mainnet",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545`,
      chainId: 1,
      gasPrice: 3000000000,
      gasMultiplier: 1,
    },
    hardhat: {
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      },
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
      chainId: 1,
      gasPrice: 30000000000,
      gasMultiplier: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  sourcify: {
    enabled: true,
  },
};
