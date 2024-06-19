// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "aerodrome/contracts/interfaces/IRouter.sol";

contract VaultTraderV2 is Ownable, ReentrancyGuard {
    address public routerAddress;
    IRouter public router;
    address public swapper;

    event SwapperSet(address indexed newSwapper);
    event SwappedStableExactIn(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOutMin, address indexed recipient);
    event SwappedVolatileExactIn(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOutMin, address indexed recipient);

    modifier onlySwapper() {
        require(msg.sender == swapper, "VaultTraderV2: Not authorized");
        _;
    }

    constructor(address _router, address _swapper) Ownable(_swapper) {
        routerAddress = _router;
        router = IRouter(_router);
        swapper = _swapper;
        emit SwapperSet(_swapper);
    }

    function setSwapper(address _swapper) external onlyOwner {
        swapper = _swapper;
        emit SwapperSet(_swapper);
    }

    function swapStableExactIn(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external onlySwapper nonReentrant {
        IRouter.Route[] memory routes = new IRouter.Route[](1);
        routes[0] = IRouter.Route(tokenIn, tokenOut, true, router.defaultFactory());

        uint256[] memory amounts = router.swapExactTokensForTokens(amountIn, amountOutMin, routes, swapper, block.timestamp + 3600);

        require(amounts[amounts.length - 1] >= amountOutMin, "Received amount is less");

        emit SwappedStableExactIn(tokenIn, tokenOut, amountIn, amounts[amounts.length - 1], swapper);
    }

    function swapVolatileExactIn(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external onlySwapper nonReentrant {
        IRouter.Route[] memory routes = new IRouter.Route[](1);
        routes[0] = IRouter.Route(tokenIn, tokenOut, false, router.defaultFactory());

        uint256[] memory amounts = router.swapExactTokensForTokens(amountIn, amountOutMin, routes, swapper, block.timestamp + 3600);

        require(amounts[amounts.length - 1] >= amountOutMin, "Received amount is less");

        emit SwappedVolatileExactIn(tokenIn, tokenOut, amountIn, amounts[amounts.length - 1], swapper);
    }
}
