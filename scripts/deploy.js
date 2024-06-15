const { ethers } = require("hardhat");
const { config } = require("../config");

// Contract address and ABI
const contractAbi = config.contract.abi;
const contractBytecode = config.contract.bytecode;

// Uniswap V2 Router address
const uniswapV2Router = config.deploy.uniswapV2Router;
// Uniswap V3 Router address
const uniswapV3Router = config.deploy.uniswapV3Router;

// WETH address
const WETH = config.deploy.WETH;

async function deploy() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  
  const swapper = deployer.address;

  const contractFactory = new ethers.ContractFactory(
    contractAbi,
    contractBytecode,
    deployer
  );

  const contract = await contractFactory.deploy(
    uniswapV2Router,
    uniswapV3Router,
    WETH,
    swapper
  );

  console.log("VaultTrader deployed to:", contract.target);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
