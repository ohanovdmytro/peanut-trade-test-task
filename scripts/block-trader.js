const { ethers } = require("hardhat");
const { config } = require("../config");

// WS provider URL
const providerUrl = config.trade.providerUrlWs;

// VaultTrader contract address and ABI
const vaultTraderAddress = config.trade.vaultTraderAddress;
const vaultTraderAbi = config.contract.abi;

// Threshold
const amountThreshold = ethers.parseUnits("40", 18);

async function tradeByBlockSwaps() {
  const provider = new ethers.WebSocketProvider(providerUrl);
  const [deployer] = await ethers.getSigners();

  const vaultTrader = new ethers.Contract(
    vaultTraderAddress,
    vaultTraderAbi,
    deployer
  );

  console.log(`Listening for new blocks...`);

  // Listen for new blocks
  provider.on("block", async (blockNumber) => {
    console.log(`New block: ${blockNumber}`);

    try {
      // Get Swapped events in current block
      const swapEvents = await vaultTrader.queryFilter(
        vaultTrader.filters.Swapped(),
        blockNumber,
        blockNumber
      );

      for (const swapEvent of swapEvents) {
        const { tokenIn, tokenOut, amountIn, amountOut } = swapEvent.args;
        const totalSwapAmount = amountIn.add(amountOut);

        // Amount check
        if (totalSwapAmount.gte(amountThreshold)) {
          const isBuy = tokenIn === config.trade.tokenIn;
          const amountToSwap = amountIn.gte(amountThreshold)
            ? amountThreshold
            : amountIn;

          console.log(
            `${isBuy ? "Buy" : "Sell"} tx of ${ethers.formatUnits(
              amountToSwap,
              18
            )} ${isBuy ? tokenOut : tokenIn} in the last block`
          );

          try {
            // Swap token
            if (isBuy) {
              const tx = await vaultTrader.swapV2ExactIn(
                tokenOut,
                tokenIn,
                amountToSwap,
                1,
                { gasLimit: 200000 }
              );

              // Wait for tx
              await tx.wait();

              console.log(
                `Successfully swapped ${ethers.formatUnits(
                  amountToSwap,
                  18
                )} ${tokenOut}`
              );
            } else {
              // Swap the token
              const tx = await vaultTrader.swapV2ExactIn(
                tokenIn,
                tokenOut,
                amountToSwap,
                1,
                { gasLimit: 200000 }
              );

              // Wait for tx
              await tx.wait();

              console.log(
                `Successfully swapped ${ethers.formatUnits(
                  amountToSwap,
                  18
                )} ${tokenIn}`
              );
            }
          } catch (error) {
            console.error(`Error during swap: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching swap events: ${error.message}`);
    }
  });
}

tradeByBlockSwaps().catch((error) => {
  console.error(error);
  process.exit(1);
});
