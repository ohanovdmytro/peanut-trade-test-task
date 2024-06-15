// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultTrader is Ownable, ReentrancyGuard {
    IUniswapV2Router02 public immutable uniswapV2Router;
    ISwapRouter public immutable uniswapV3Router;
    IWETH public immutable WETH;
    address public swapper;

    event SwapperSet(address indexed newSwapper);
    event Swapped(
        address indexed tokenIn,
        address indexed tokenOut,
        uint amountIn,
        uint amountOut,
        uint fee,
        bool isV3
    );
    event Withdrawn(address indexed tokenAddress, uint amount, address recipient);

    modifier onlySwapper() {
        require(msg.sender == swapper, "VaultTrader: Not authorized");
        _;
    }

    constructor (
        address _uniswapV2Router,
        address _uniswapV3Router,
        address _WETH,
        address _swapper
    ) Ownable(_swapper) {
        uniswapV2Router = IUniswapV2Router02(_uniswapV2Router);
        uniswapV3Router = ISwapRouter(_uniswapV3Router);
        WETH = IWETH(_WETH);
        swapper = _swapper;
        emit SwapperSet(_swapper);
    }

    function setSwapper(address _swapper) external onlyOwner {
        swapper = _swapper;
        emit SwapperSet(_swapper);
    }

    function swapV2ExactIn(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint amountOutMin
    ) external onlySwapper nonReentrant {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(uniswapV2Router), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint[] memory amounts = uniswapV2Router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );

        IERC20(tokenIn).approve(address(uniswapV2Router), 0);

        emit Swapped(tokenIn, tokenOut, amountIn, amounts[1], 0, false);
    }

    function swapV3ExactIn(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint amountIn,
        uint amountOutMin
    ) external onlySwapper nonReentrant {
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(uniswapV3Router), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });

        uint amountOut = uniswapV3Router.exactInputSingle(params);

        IERC20(tokenIn).approve(address(uniswapV3Router), 0);

        emit Swapped(tokenIn, tokenOut, amountIn, amountOut, fee, true);
    }

    function withdrawTokensWithUnwrapIfNecessary(address tokenAddress, address recipient) external onlyOwner nonReentrant {
        uint balance = IERC20(tokenAddress).balanceOf(address(this));
        if (tokenAddress == address(WETH)) {
            // WETH -> ETH
            WETH.withdraw(balance);
            payable(recipient).transfer(balance);
        } else {
            IERC20(tokenAddress).transfer(recipient, balance);
        }
        emit Withdrawn(tokenAddress, balance, recipient);
    }

    // ETH -> WETH
    receive() external payable {
        if (msg.sender != address(WETH)) {
            WETH.deposit{value: msg.value}();
        }
    }
}
