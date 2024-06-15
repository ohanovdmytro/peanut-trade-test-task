const { ethers } = require("hardhat");
const { config } = require("../config");

//Trader contract address and ABI
const vaultTraderAddress = config.trade.vaultTraderAddress;
const vaultTraderAbi = config.contract.abi;

//Token 1
const tokenIn = config.trade.tokenIn;
// Token 2
const tokenOut = config.trade.tokenOut;

// N (amount to swap)
const amountIn = ethers.parseUnits("40", 18);

async function tradeOnceIn5Min() {
  console.log("Starting every 5 min swap proccess...");

  try {
    const [deployer] = await ethers.getSigners();

    const vaultTraderContract = await new ethers.Contract(
      vaultTraderAddress,
      vaultTraderAbi,
      deployer
    );

    try {
      //Swap
      const tx = await vaultTraderContract.swapV2ExactIn(
        tokenIn,
        tokenOut,
        amountIn,
        1,
        {
          gasLimit: 200000,
        }
      );

      //Tx confiramtion
      await tx.wait();

      console.log("Swap completed:", tx.hash);
    } catch (error) {
      console.error(`Error during buy swap: ${error.message}`);
    }

    try {
      //Swap back
      const tx = await vaultTraderContract.swapV2ExactIn(
        tokenOut,
        tokenIn,
        amountIn,
        1,
        {
          gasLimit: 200000,
        }
      );

      //Tx confiramtion
      await tx.wait();

      console.log("Swap back completed:", tx.hash);
    } catch (error) {
      console.error(`Error during sell swap: ${error.message}`);
    }

    //Wait 5 mins
    await waitFiveMinutes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Wait 5 min func
function waitFiveMinutes() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 5 * 60 * 1000);
  });
}

tradeOnceIn5Min().catch((error) => {
  console.error(error);
  process.exit(1);
});
