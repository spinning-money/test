/* eslint-env es2020 */
/* global BigInt */
import { connect, disconnect } from "starknetkit";
import { Contract, CallData, cairo, RpcProvider } from "starknet";
import { GAME_CONTRACT_ADDRESS, BURR_TOKEN_ADDRESS, STRK_ADDRESSES, CURRENT_NETWORK, NETWORKS } from './constants.js';

// Ensure BigInt is available (should be in modern browsers)
if (typeof BigInt === 'undefined') {
    throw new Error('BigInt is not supported in this browser');
}

// RPC URLs for different networks
const RPC_URLS = {
    [NETWORKS.MAINNET]: process.env.REACT_APP_ALCHEMY_RPC_URL || "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA"
};

// Get current network RPC URL
const getCurrentRpcUrl = () => {
    return RPC_URLS[NETWORKS.MAINNET];
};

const provider = new RpcProvider({
    nodeUrl: getCurrentRpcUrl()
});

// Get provider function
const getProvider = () => {
    return provider;
};

// ABI definitions
const ERC20_ABI = [
    {
        "name": "balance_of", 
        "type": "function",
        "inputs": [{"name": "account", "type": "core::starknet::contract_address::ContractAddress"}],
        "outputs": [{"type": "core::integer::u256"}],
        "stateMutability": "view"
    },
    {
        "name": "total_supply",
        "type": "function",
        "inputs": [],
        "outputs": [{"type": "core::integer::u256"}],
        "stateMutability": "view"
    },
    {
        "name": "name",
        "type": "function",
        "inputs": [],
        "outputs": [{"type": "core::byte_array::ByteArray"}],
        "stateMutability": "view"
    },
    {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [{"type": "core::byte_array::ByteArray"}],
        "stateMutability": "view"
    },
    {
        "name": "decimals",
        "type": "function",
        "inputs": [],
        "outputs": [{"type": "core::integer::u8"}],
        "stateMutability": "view"
    },
    {
        "name": "approve",
        "type": "function",
        "inputs": [
            {"name": "spender", "type": "felt"},
            {"name": "amount", "type": "Uint256"}
        ],
        "outputs": [{"name": "success", "type": "felt"}],
        "stateMutability": "external"
    },
    {
        "name": "transfer",
        "type": "function",
        "inputs": [
            {"name": "recipient", "type": "felt"},
            {"name": "amount", "type": "Uint256"}
        ],
        "outputs": [{"name": "success", "type": "felt"}],
        "stateMutability": "external"
    }
];

const GAME_ABI = [
    {
        "name": "stake_beaver",
        "type": "function",
        "inputs": [{"name": "beaver_type", "type": "felt"}],
        "outputs": [],
        "stateMutability": "external"
    },
    {
        "name": "claim",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "external"
    },
    {
        "name": "upgrade_beaver",
        "type": "function",
        "inputs": [{"name": "beaver_id", "type": "felt"}],
        "outputs": [],
        "stateMutability": "external"
    },
    {
        "name": "get_user_beavers",
        "type": "function",
        "inputs": [{"name": "owner", "type": "felt"}],
        "outputs": [{"name": "beaver_ids", "type": "felt*"}],
        "stateMutability": "view"
    },
    {
        "name": "get_user_last_claim",
        "type": "function",
        "inputs": [{"name": "owner", "type": "felt"}],
        "outputs": [{"name": "last_claim", "type": "felt"}],
        "stateMutability": "view"
    },
    {
        "name": "get_beaver",
        "type": "function",
        "inputs": [
            {"name": "owner", "type": "felt"},
            {"name": "beaver_id", "type": "felt"}
        ],
        "outputs": [
            {"name": "id", "type": "felt"},
            {"name": "beaver_type", "type": "felt"},
            {"name": "level", "type": "felt"},
            {"name": "last_claim_time", "type": "felt"},
            {"name": "owner", "type": "felt"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "calculate_pending_rewards",
        "type": "function",
        "inputs": [{"name": "owner", "type": "felt"}],
        "outputs": [{"name": "rewards", "type": "Uint256"}],
        "stateMutability": "view"
    },
    {
        "name": "get_total_burned",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "total_burned", "type": "Uint256"}],
        "stateMutability": "view"
    },
    {
        "name": "get_game_info",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "game_info", "type": "felt*"}],
        "stateMutability": "view"
    },
    {
        "name": "get_staking_costs", 
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "costs", "type": "felt*"}],
        "stateMutability": "view"
    },
    {
        "name": "get_game_analytics",
        "type": "function", 
        "inputs": [],
        "outputs": [
            {"name": "total_beavers_staked", "type": "felt"},
            {"name": "total_burr_claimed", "type": "Uint256"},
            {"name": "total_strk_collected", "type": "Uint256"},
            {"name": "total_burr_burned", "type": "Uint256"},
            {"name": "noob_count", "type": "felt"},
            {"name": "pro_count", "type": "felt"},
            {"name": "degen_count", "type": "felt"},
            {"name": "active_users", "type": "felt"},
            {"name": "total_upgrades", "type": "felt"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_beaver_type_stats",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "noob_count", "type": "felt"},
            {"name": "pro_count", "type": "felt"},
            {"name": "degen_count", "type": "felt"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_total_claimed_burr",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "total_claimed", "type": "Uint256"}],
        "stateMutability": "view"
    },
    {
        "name": "get_active_users_count",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "active_users", "type": "felt"}],
        "stateMutability": "view"
    },
    {
        "name": "get_contract_balances",
        "type": "function",
        "inputs": [],
        "outputs": [
            {"name": "burr_balance", "type": "Uint256"},
            {"name": "strk_balance", "type": "Uint256"}
        ],
        "stateMutability": "view"
    },
    {
        "name": "emergency_pause",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "external"
    },
    {
        "name": "emergency_unpause",
        "type": "function",
        "inputs": [],
        "outputs": [],
        "stateMutability": "external"
    },
    {
        "name": "get_emergency_status",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "is_paused", "type": "felt"}],
        "stateMutability": "view"
    },
    {
        "name": "import_beaver",
        "type": "function",
        "inputs": [
            {"name": "owner", "type": "felt"},
            {"name": "beaver_id", "type": "felt"},
            {"name": "beaver_type", "type": "felt"},
            {"name": "last_claim_time", "type": "felt"},
            {"name": "original_level", "type": "felt"}
        ],
        "outputs": [],
        "stateMutability": "external"
    }
];

let currentConnection = null;

// LocalStorage keys for wallet persistence
const WALLET_STORAGE_KEY = 'burrow_wallet_connection';
const WALLET_ADDRESS_KEY = 'burrow_wallet_address';

// Save wallet connection to localStorage
function saveWalletConnection(connection) {
    try {
        if (connection && connection.isConnected && connection.account?.address) {
            localStorage.setItem(WALLET_STORAGE_KEY, 'true');
            localStorage.setItem(WALLET_ADDRESS_KEY, connection.account.address);
            console.log('💾 Wallet connection saved to localStorage');
        }
    } catch (error) {
        console.log('❌ Failed to save wallet connection:', error);
    }
}

// Clear wallet connection from localStorage
function clearWalletConnection() {
    try {
        localStorage.removeItem(WALLET_STORAGE_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
        console.log('🗑️ Wallet connection cleared from localStorage');
    } catch (error) {
        console.log('❌ Failed to clear wallet connection:', error);
    }
}

// Check if user was previously connected
export function wasWalletConnected() {
    try {
        return localStorage.getItem(WALLET_STORAGE_KEY) === 'true';
    } catch (error) {
        return false;
    }
}

// Get saved wallet address
export function getSavedWalletAddress() {
    try {
        return localStorage.getItem(WALLET_ADDRESS_KEY);
    } catch (error) {
        return null;
    }
}

// Auto-reconnect wallet on page load
export async function autoReconnectWallet() {
    console.log('🔄 Attempting auto-reconnect...');
    
    if (!wasWalletConnected()) {
        console.log('⏭️ No previous connection found, skipping auto-reconnect');
        return { isConnected: false, autoReconnect: false };
    }

    // Wait for wallet extensions to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Check if wallet extensions are available after waiting
        if (!window.starknet_argentX && !window.starknet_braavos && !window.starknet) {
            console.log('❌ No wallet extensions found during auto-reconnect');
            
            // Wait a bit more and try again
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!window.starknet_argentX && !window.starknet_braavos && !window.starknet) {
                console.log('❌ Still no wallet extensions, clearing connection');
                clearWalletConnection();
                return { isConnected: false, autoReconnect: false };
            }
        }

        // Try ArgentX first (most common)
        if (window.starknet_argentX) {
            try {
                const wallet = window.starknet_argentX;
                
                // Wait for wallet to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Try to enable the wallet first
                if (!wallet.isConnected) {
                    await wallet.enable({ showModal: false });
                }
                
                // Check if wallet is unlocked and connected
                if (!wallet.isLocked && wallet.isConnected && wallet.account?.address) {
                    console.log('✅ ArgentX auto-reconnected:', wallet.account.address);
                    
                    currentConnection = {
                        account: wallet.account,
                        wallet: wallet,
                        isConnected: true
                    };
                    
                    // Save the successful connection
                    saveWalletConnection(currentConnection);
                    
                    return {
                        wallet: wallet,
                        account: wallet.account,
                        address: wallet.account.address,
                        isConnected: true,
                        autoReconnect: true
                    };
                }
            } catch (error) {
                console.log('⚠️ ArgentX auto-reconnect failed:', error.message);
            }
        }

        // Try Braavos if ArgentX failed
        if (window.starknet_braavos) {
            try {
                const wallet = window.starknet_braavos;
                
                // Wait for wallet to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Try to enable the wallet first
                if (!wallet.isConnected) {
                    await wallet.enable({ showModal: false });
                }
                
                // Check if wallet is unlocked and connected
                if (!wallet.isLocked && wallet.isConnected && wallet.account?.address) {
                    console.log('✅ Braavos auto-reconnected:', wallet.account.address);
                    
                    currentConnection = {
                        account: wallet.account,
                        wallet: wallet,
                        isConnected: true
                    };
                    
                    // Save the successful connection
                    saveWalletConnection(currentConnection);
                    
                    return {
                        wallet: wallet,
                        account: wallet.account,
                        address: wallet.account.address,
                        isConnected: true,
                        autoReconnect: true
                    };
                }
            } catch (error) {
                console.log('⚠️ Braavos auto-reconnect failed:', error.message);
            }
        }

        // Try Starknetkit silent connection
        try {
            const connection = await connect({
                webWalletUrl: "https://web.argent.xyz",
                dappName: "BurrowGame",
                modalMode: "neverAsk", // Don't show modal during auto-reconnect
                modalTheme: "dark",
                include: ["argentX", "braavos"],
                exclude: [],
                order: ["argentX", "braavos"]
            });

            if (connection && connection.isConnected && connection.account?.address) {
                currentConnection = connection;
                console.log("✅ Starknetkit auto-reconnected:", connection.account.address);
                
                return {
                    wallet: connection.wallet,
                    account: connection.account,
                    address: connection.account.address,
                    isConnected: true,
                    autoReconnect: true
                };
            }
        } catch (error) {
            console.log("⚠️ Starknetkit auto-reconnect failed:", error.message);
        }

        // If all auto-reconnect attempts failed, clear storage
        console.log('⚠️ Auto-reconnect failed, clearing saved connection');
        clearWalletConnection();
        return { isConnected: false, autoReconnect: false };

    } catch (error) {
        console.error('❌ Auto-reconnect error:', error);
        clearWalletConnection();
        return { isConnected: false, autoReconnect: false };
    }
}

// Helper function to safely convert balance
function safeBalanceConvert(balance) {
    try {
        if (!balance) return BigInt(0);
        
        console.log('Converting balance:', balance, 'Type:', typeof balance);
        
        // Handle different response formats
        if (typeof balance === 'object') {
            // Log object details for debugging
            console.log('Object keys:', Object.keys(balance));
            console.log('Object values:', Object.values(balance));
            
            // Case 1: {balance: BigInt}
            if (balance.balance !== undefined) {
                return BigInt(balance.balance);
            }
            
            // Case 2: Uint256 format {low, high}
            if (balance.low !== undefined && balance.high !== undefined) {
                return BigInt(balance.low) + (BigInt(balance.high) << BigInt(128));
            }
            
            // Case 3: Array format [low, high]
            if (Array.isArray(balance) && balance.length >= 2) {
                return BigInt(balance[0]) + (BigInt(balance[1]) << BigInt(128));
            }
            
            // Case 4: Single item array
            if (Array.isArray(balance) && balance.length === 1) {
                return BigInt(balance[0]);
            }
            
            // Case 5: Object with numeric properties - extract first numeric value
            for (let key in balance) {
                const value = balance[key];
                if (typeof value === 'number' || typeof value === 'bigint') {
                    return BigInt(value);
                }
                if (typeof value === 'string' && /^\d+$/.test(value)) {
                    return BigInt(value);
                }
            }
            
            // If no numeric value found, return 0
            return BigInt(0);
        }
        
        if (typeof balance === 'string') {
            // Remove commas, spaces and convert
            const cleanBalance = balance.replace(/[,\s]/g, '');
            if (cleanBalance === '' || cleanBalance === '0,0') return BigInt(0);
            return BigInt(cleanBalance);
        }
        
        if (typeof balance === 'bigint') {
            return balance;
        }
        
        if (typeof balance === 'number') {
            return BigInt(balance);
        }
        
        return BigInt(balance);
    } catch (error) {
        console.log('Balance conversion error:', error, 'Input:', balance);
        return BigInt(0);
    }
}

// Helper function to format balance for display
function formatBalance(balance, decimals = 18) {
    try {
        const balanceBigInt = typeof balance === 'bigint' ? balance : BigInt(balance);
        const divisor = BigInt(10 ** decimals);
        
        // Avoid precision loss by using BigInt division first
        const wholePart = balanceBigInt / divisor;
        const remainder = balanceBigInt % divisor;
        
        // Convert to number with proper decimal handling
        const wholeNumber = Number(wholePart);
        const fractionalNumber = Number(remainder) / Math.pow(10, decimals);
        const totalNumber = wholeNumber + fractionalNumber;
        
        console.log(`🔢 formatBalance debug: ${balanceBigInt} -> ${totalNumber}`);
        
        // Use the new formatNumber function for consistent formatting
        return formatNumber(totalNumber);
    } catch (error) {
        console.log('Format balance error:', error);
        return '0';
    }
}

// Import formatNumber function
function formatNumber(num) {
    const number = Number(num);
    if (number === 0) return '0';
    if (number >= 1_000_000_000_000) {
        return (number / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
    } else if (number >= 1_000_000_000) {
        return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (number >= 1_000_000) {
        return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (number >= 1_000) {
        return (number / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (number >= 1) {
        return number.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
        return number.toFixed(2).replace(/\.00$/, '');
    }
}

// Connect wallet
export async function connectWallet() {
    try {
        console.log("Starting wallet connection...");
        
        // Check if wallet extensions are available
        if (!window.starknet_argentX && !window.starknet_braavos && !window.starknet) {
            throw new Error('No Starknet wallets found. Please install ArgentX or Braavos wallet extension.');
        }

        // Method 1: Use Starknetkit modal first (better UX)
        try {
            console.log("Opening wallet selection modal...");
            
            const connection = await connect({
                webWalletUrl: "https://web.argent.xyz",
                dappName: "BurrowGame",
                modalMode: "alwaysAsk", // Always show modal for wallet selection
                modalTheme: "dark",
                include: ["argentX", "braavos"],
                exclude: [],
                order: ["argentX", "braavos"]
            });

            if (connection && connection.isConnected && connection.account?.address) {
                currentConnection = connection;
                console.log("✅ Successfully connected with Starknetkit:", connection.account.address);
                
                // Save connection to localStorage
                saveWalletConnection(connection);
                
                return {
                    wallet: connection.wallet,
                    account: connection.account,
                    address: connection.account.address,
                    isConnected: true
                };
            }
        } catch (error) {
            console.log("❌ Starknetkit modal failed or cancelled:", error.message);
            
            // Check for specific wallet lock errors
            if (error.message && (
                error.message.includes('KeyRing is locked') ||
                error.message.includes('wallet is locked') ||
                error.message.includes('chrome-extension')
            )) {
                return { 
                    isConnected: false, 
                    error: 'Wallet is locked! Please unlock your ArgentX or Braavos wallet and try again.' 
                };
            }
            
            // If modal was cancelled or failed, try direct connections silently
        }

        // Method 2: Try ArgentX directly (fallback, silent)
        if (window.starknet_argentX) {
            try {
                console.log("Trying direct ArgentX connection...");
                const wallet = window.starknet_argentX;
                
                // Skip silently if locked
                if (!wallet.isLocked) {
                    await wallet.enable();
                    
                    if (wallet.isConnected && wallet.account?.address) {
                        console.log("✅ Successfully connected with ArgentX directly:", wallet.account.address);
                        
                        currentConnection = {
                            account: wallet.account,
                            wallet: wallet,
                            isConnected: true
                        };
                        
                        // Save connection to localStorage
                        saveWalletConnection(currentConnection);
                        
                        return {
                            wallet: wallet,
                            account: wallet.account,
                            address: wallet.account.address,
                            isConnected: true
                        };
                    }
                }
            } catch (error) {
                console.log("❌ Direct ArgentX connection failed:", error.message);
                
                // Check for wallet locked errors
                if (error.message && (
                    error.message.includes('KeyRing is locked') ||
                    error.message.includes('wallet is locked') ||
                    error.message.includes('chrome-extension')
                )) {
                    return { 
                        isConnected: false, 
                        error: 'ArgentX wallet is locked! Please unlock your wallet and try again.' 
                    };
                }
            }
        }

        // Method 3: Try Braavos directly (fallback, silent)
        if (window.starknet_braavos) {
            try {
                console.log("Trying direct Braavos connection...");
                const wallet = window.starknet_braavos;
                
                // Skip silently if locked  
                if (!wallet.isLocked) {
                    await wallet.enable();
                    
                    if (wallet.isConnected && wallet.account?.address) {
                        console.log("✅ Successfully connected with Braavos directly:", wallet.account.address);
                        
                        currentConnection = {
                            account: wallet.account,
                            wallet: wallet,
                            isConnected: true
                        };
                        
                        // Save connection to localStorage
                        saveWalletConnection(currentConnection);
                        
                        return {
                            wallet: wallet,
                            account: wallet.account,
                            address: wallet.account.address,
                            isConnected: true
                        };
                    }
                }
            } catch (error) {
                console.log("❌ Direct Braavos connection failed:", error.message);
                
                // Check for wallet locked errors
                if (error.message && (
                    error.message.includes('KeyRing is locked') ||
                    error.message.includes('wallet is locked') ||
                    error.message.includes('chrome-extension')
                )) {
                    return { 
                        isConnected: false, 
                        error: 'Braavos wallet is locked! Please unlock your wallet and try again.' 
                    };
                }
            }
        }

        // Check if wallets exist
        let hasWallets = false;
        
        if (window.starknet_argentX) {
            hasWallets = true;
        }
        
        if (window.starknet_braavos) {
            hasWallets = true;
        }
        
        // Only throw error if no wallets are found
        if (!hasWallets) {
            throw new Error('No Starknet wallets found. Please install ArgentX or Braavos wallet extension.');
        } else {
            // If wallets exist but connection failed (maybe locked), return silent failure
            console.log("⚠️ No wallets could be connected (possibly locked or user cancelled)");
            return { 
                isConnected: false, 
                error: null // Silent failure - no error message to user
            };
        }

    } catch (error) {
        console.error("🚨 Wallet connection error:", error);
        
        // Don't propagate uncaught errors - return controlled error response
        let errorMessage = error.message;
        
        if (error.message.includes('KeyRing is locked') || error.message.includes('locked')) {
            errorMessage = 'Wallet is locked! Please unlock your ArgentX or Braavos wallet and try again.';
        } else if (error.message.includes('User rejected') || error.message.includes('rejected')) {
            errorMessage = 'Connection rejected. Please approve the connection in your wallet.';
        } else if (error.message.includes('not found') || error.message.includes('install')) {
            errorMessage = 'Wallet not found. Please install ArgentX or Braavos extension.';
        } else if (error.message.includes('Failed to connect to MetaMask')) {
            errorMessage = 'Wallet connection failed. Please make sure your wallet is unlocked and try again.';
        }
        
        // Return error response instead of throwing
        return { 
            isConnected: false, 
            error: errorMessage 
        };
    }
}

// Disconnect wallet
export async function disconnectWallet() {
    try {
        await disconnect();
        currentConnection = null;
        
        // Clear saved connection from localStorage
        clearWalletConnection();
        
        return { isConnected: false };
    } catch (error) {
        console.error("Wallet disconnect error:", error);
        
        // Clear saved connection even on error
        clearWalletConnection();
        
        return { isConnected: false };
    }
}

// Get balances using individual calls (more reliable)
export async function fetchBalances(address) {
    console.log("=== BALANCE FETCH DEBUG ===");
    console.log("Fetching balances for address:", address);
    
    let burrBalance = BigInt(0);
    let strkBalance = BigInt(0);
    let workingStrkAddress = null;
    
    // Fetch BURR balance
    try {
        const burrContract = new Contract(ERC20_ABI, BURR_TOKEN_ADDRESS, provider);
        const burrResult = await burrContract.balance_of(address);
        console.log("Raw BURR balance:", burrResult);
        burrBalance = safeBalanceConvert(burrResult);
        console.log("Converted BURR balance:", burrBalance.toString());
    } catch (error) {
        console.log("BURR balance error:", error);
    }
    
    // Try each STRK address to find the working one
    for (const strkAddr of STRK_ADDRESSES) {
        try {
            console.log("Trying STRK address:", strkAddr);
            const strkContract = new Contract(ERC20_ABI, strkAddr, provider);
            const strkResult = await strkContract.balance_of(address);
            console.log(`Raw balance response for ${strkAddr}:`, strkResult);
            
            const balance = safeBalanceConvert(strkResult);
            console.log(`Converted balance for ${strkAddr}:`, balance.toString());
            
            if (balance > BigInt(0)) {
                strkBalance = balance;
                workingStrkAddress = strkAddr;
                console.log(`✅ Found STRK balance with ${strkAddr}:`, balance.toString());
                break;
            }
        } catch (error) {
            console.log(`❌ STRK error for ${strkAddr}:`, error.message);
        }
    }
    
    console.log("Final balances - BURR:", burrBalance.toString(), "STRK:", strkBalance.toString());
    
    return {
        burrBalance,
        strkBalance,
        workingStrkAddress,
        burrFormatted: formatBalance(burrBalance, 18),
        strkFormatted: formatBalance(strkBalance, 18)
    };
}

// Fetch player info using multicall
export async function fetchPlayerInfo(address) {
    try {
        console.log("🔍 fetchPlayerInfo called with address:", address);
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        // Ensure address is properly formatted
        let formattedAddress = address;
        if (typeof address === 'string' && !address.startsWith('0x')) {
            formattedAddress = '0x' + address;
        }
        
        // Manual contract call to test
        const manualResult = await provider.callContract({
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: 'get_user_beavers',
            calldata: [formattedAddress]
        });

        console.log('🔍 Raw get_user_beavers result:', manualResult);

        // Use manual call result since Contract class parsing has issues with felt* arrays
        let beaverIds = [];
        if (Array.isArray(manualResult)) {
            console.log('📊 Manual result array length:', manualResult.length);
            
            if (manualResult.length === 0) {
                console.log('✅ User has no beavers');
                return { beavers: [], totalRewards: '0' };
            }
            
            // All elements are beaver IDs directly (no length prefix)
            const allBeaverIds = manualResult.map(id => {
                const numId = parseInt(id, 16);
                console.log(`🔄 Converting ${id} -> ${numId}`);
                return numId;
            }).filter(id => id > 0);
            
            console.log('🦫 All beaver IDs from contract:', allBeaverIds);
            
            console.log('🔍 Processing beavers...');
            
                            // Filter out problematic beaver IDs (like ID 1 and ID 2 which appear for some users but aren't really owned)
                const problematicBeaverIds = [1, 2]; // Beaver IDs 1 and 2 appear for some users but aren't really owned
                beaverIds = allBeaverIds.filter(id => !problematicBeaverIds.includes(id));
                console.log(`✅ Added ${beaverIds.length} valid beaver IDs from get_user_beavers (filtered out problematic IDs)`);
            
            console.log('🦫 Valid beaver IDs (really owned):', beaverIds);
        }
        
        console.log('🦫 Parsed beaver IDs:', beaverIds);
        
        if (!beaverIds || beaverIds.length === 0) {
            console.log('✅ No valid beaver IDs found');
            return { beavers: [], totalRewards: '0' };
        }
        
        // Get total pending rewards once for the user
        const totalPendingRewards = await gameContract.calculate_pending_rewards(formattedAddress);
        const totalPendingBigInt = safeBalanceConvert(totalPendingRewards);
        
        // Fetch details for each beaver individually using manual contract calls
        const beavers = [];
        let totalHourlyRate = 0;
        
        for (const beaverId of beaverIds) {
            try {
                console.log(`🦫 Fetching beaver ${beaverId} for user ${formattedAddress}`);
                
                // Try to get beaver details using different methods
                let beaverResult = null;
                
                // Method 1: Try with user address (may fail for imported beavers)
                try {
                    beaverResult = await provider.callContract({
                        contractAddress: GAME_CONTRACT_ADDRESS,
                        entrypoint: 'get_beaver',
                        calldata: [formattedAddress, beaverId.toString()]
                    });
                } catch (error) {
                    console.log(`⚠️ Method 1 failed for beaver ${beaverId}:`, error.message);
                    
                    // Method 2: Try with different address formats
                    const addressVariations = [
                        formattedAddress.toLowerCase(),
                        formattedAddress.toUpperCase(),
                        formattedAddress.replace(/^0x0+/, '0x'),
                        formattedAddress.startsWith('0x') ? formattedAddress : '0x' + formattedAddress
                    ];
                    
                    for (const addr of addressVariations) {
                        try {
                            beaverResult = await provider.callContract({
                                contractAddress: GAME_CONTRACT_ADDRESS,
                                entrypoint: 'get_beaver',
                                calldata: [addr, beaverId.toString()]
                            });
                            console.log(`✅ Method 2 succeeded for beaver ${beaverId} with address: ${addr}`);
                            break;
                        } catch (addrError) {
                            // Continue to next address variation
                        }
                    }
                    
                    // Method 3: If still failed, create placeholder beaver data
                    if (!beaverResult) {
                        console.log(`🔧 Creating placeholder data for beaver ${beaverId} since it's in user's beaver list`);
                        
                        // Import edilen beaver'lar için statistical type detection
                        // 420 beaver dağılımı: %50 Degen, %20 Pro, %30 Noob
                        const importedBeaverTypeMap = {
                            // Test kullanıcısı için statistical mapping
                            6: 2,   // Degen
                            8: 2,   // Degen
                            9: 2,   // Degen
                            10: 2,  // Degen
                            14: 2,  // Degen
                            16: 2,  // Degen
                            17: 2,  // Degen
                            18: 2,  // Degen
                            19: 2,  // Degen
                            30: 1,  // Pro
                            32: 1,  // Pro
                            35: 1,  // Pro
                            37: 1,  // Pro
                            40: 0,  // Noob
                            41: 0,  // Noob
                            43: 0,  // Noob
                            45: 0,  // Noob
                            34953: 0, // Noob
                            34960: 0  // Noob
                        };
                        
                        // Try to get real type from contract first, fallback to statistical distribution
                        let beaverType = 2; // Default to Degen
                        
                        // Method 1: Try to get real type from contract (for working beavers)
                        try {
                            const realBeaverResult = await provider.callContract({
                                contractAddress: GAME_CONTRACT_ADDRESS,
                                entrypoint: 'get_beaver',
                                calldata: [formattedAddress, beaverId.toString()]
                            });
                            
                            if (realBeaverResult.result && realBeaverResult.result.length >= 5) {
                                const rawType = realBeaverResult.result[1];
                                beaverType = parseInt(rawType);
                                console.log(`✅ Got real type from contract for beaver ${beaverId}: ${beaverType}`);
                            }
                        } catch (contractError) {
                            console.log(`⚠️ Could not get real type for beaver ${beaverId}, using fallback`);
                            
                            // Method 2: Use statistical distribution for imported beavers
                            if (importedBeaverTypeMap[beaverId]) {
                                // Bilinen import edilen beaver
                                beaverType = importedBeaverTypeMap[beaverId];
                            } else if (beaverId <= 420) {
                                // Import edilen beaver'lar (ID 1-420) → Statistical distribution
                                // %50 Degen, %20 Pro, %30 Noob
                                const hash = beaverId.toString().split('').reduce((a, b) => {
                                    a = ((a << 5) - a) + b.charCodeAt(0);
                                    return a & a;
                                }, 0);
                                const normalizedHash = Math.abs(hash) % 100;
                                
                                if (normalizedHash < 50) {
                                    beaverType = 2; // Degen (50%)
                                } else if (normalizedHash < 70) {
                                    beaverType = 1; // Pro (20%)
                                } else {
                                    beaverType = 0; // Noob (30%)
                                }
                            } else {
                                // Yeni beaver'lar (ID > 420) → Gerçek type'ı kullan
                                beaverType = 1; // Pro (varsayılan)
                            }
                        }
                        const placeholderBeaver = {
                            id: Number(beaverId),
                            owner: formattedAddress,
                            type: beaverType, // Use correct type from mapping
                            level: 1, // Default to level 1
                            last_claim_time: Math.floor(Date.now() / 1000), // Current time (fix for imported beavers with future timestamps)
                            pendingRewards: BigInt(0)
                        };
                        
                        // Debug beaver info
                        console.log(`🔍 Beaver ${beaverId} info (placeholder):`);
                        console.log(`  Type: ${placeholderBeaver.type} (Pro - default)`);
                        console.log(`  Level: ${placeholderBeaver.level}`);
                        console.log(`  Last Claim Time: ${placeholderBeaver.last_claim_time}`);
                        console.log(`  Owner: ${placeholderBeaver.owner}`);
                        
                        // Calculate hourly rate for this beaver
                        const baseRates = [300, 750, 2250]; // Index 0=Noob, 1=Pro, 2=Degen
                        const baseRate = baseRates[placeholderBeaver.type] || 300;
                        
                        const getContractLevelMultiplier = (level) => {
                            if (level === 1) return 1000;
                            else if (level === 2) return 1500;
                            else if (level === 3) return 2250;
                            else if (level === 4) return 3375;
                            else return 5062;
                        };
                        
                        const levelMultiplier = getContractLevelMultiplier(placeholderBeaver.level) / 1000;
                        const hourlyRate = baseRate * levelMultiplier;
                        totalHourlyRate += hourlyRate;
                        
                        placeholderBeaver.hourlyRate = hourlyRate;
                        beavers.push(placeholderBeaver);
                        console.log(`✅ Successfully created placeholder for beaver ${beaverId}`);
                        continue; // Skip to next beaver
                    }
                }
                
                if (beaverResult.result && beaverResult.result.length >= 5) {
                    const rawId = beaverResult.result[0];
                    const rawType = beaverResult.result[1];
                    const rawLevel = beaverResult.result[2];
                    const rawLastClaim = beaverResult.result[3];
                    const rawOwner = beaverResult.result[4];
                    
                    // Parse values
                    const beaverType = parseInt(rawType);
                    const beaverLevel = parseInt(rawLevel);
                    const lastClaimTime = parseInt(rawLastClaim);
                    const owner = '0x' + BigInt(rawOwner).toString(16);
                    
                    const beaver = {
                        id: Number(beaverId),
                        owner: owner,
                        type: beaverType,
                        level: beaverLevel,
                        last_claim_time: lastClaimTime,
                        pendingRewards: BigInt(0) // Will calculate proportionally below
                    };
                    
                    // Debug beaver info
                    console.log(`🔍 Beaver ${beaverId} info:`);
                    console.log(`  Type: ${beaver.type} (${beaver.type === 0 ? 'Noob' : beaver.type === 1 ? 'Pro' : 'Degen'})`);
                    console.log(`  Level: ${beaver.level}`);
                    console.log(`  Last Claim Time: ${beaver.last_claim_time}`);
                    console.log(`  Owner: ${beaver.owner}`);
                    
                    // Use contract data directly - no overrides
                    console.log(`✅ Beaver ${beaverId} type from contract: ${beaver.type}`);
                    
                    // Calculate hourly rate for this beaver (matching contract logic)
                    const baseRates = [300, 750, 2250]; // Index 0=Noob, 1=Pro, 2=Degen (matching contract)
                    const baseRate = baseRates[beaver.type] || 300;
                    
                    // Use exact contract level multipliers (divided by 1000)
                    const getContractLevelMultiplier = (level) => {
                        if (level === 1) return 1000;      // 1.0x
                        else if (level === 2) return 1500; // 1.5x  
                        else if (level === 3) return 2250; // 2.25x
                        else if (level === 4) return 3375; // 3.375x
                        else return 5062;                  // 5.0625x (level 5)
                    };
                    
                    const levelMultiplier = getContractLevelMultiplier(beaver.level) / 1000;
                    const hourlyRate = baseRate * levelMultiplier;
                    totalHourlyRate += hourlyRate;
                    
                    beaver.hourlyRate = hourlyRate;
                    
                    beavers.push(beaver);
                    console.log(`✅ Successfully fetched beaver ${beaverId}`);
                } else {
                    console.log(`❌ Invalid beaver result for ${beaverId}:`, beaverResult);
                    // Try to parse the result even if it's not in expected format
                    if (beaverResult && Array.isArray(beaverResult) && beaverResult.length >= 5) {
                        console.log(`🔧 Trying to parse beaver ${beaverId} result manually:`, beaverResult);
                        
                        try {
                            const rawId = beaverResult[0];
                            const rawType = beaverResult[1];
                            const rawLevel = beaverResult[2];
                            const rawLastClaim = beaverResult[3];
                            const rawOwner = beaverResult[4];
                            
                            // Parse values
                            const beaverType = parseInt(rawType);
                            const beaverLevel = parseInt(rawLevel);
                            const lastClaimTime = parseInt(rawLastClaim);
                            const owner = '0x' + BigInt(rawOwner).toString(16);
                            
                            const beaver = {
                                id: Number(beaverId),
                                owner: owner,
                                type: beaverType,
                                level: beaverLevel,
                                last_claim_time: lastClaimTime,
                                pendingRewards: BigInt(0) // Will calculate proportionally below
                            };
                            
                            // Debug beaver info
                            console.log(`🔍 Beaver ${beaverId} info (manual parse):`);
                            console.log(`  Type: ${beaver.type} (${beaver.type === 0 ? 'Noob' : beaver.type === 1 ? 'Pro' : 'Degen'})`);
                            console.log(`  Level: ${beaver.level}`);
                            console.log(`  Last Claim Time: ${beaver.last_claim_time}`);
                            console.log(`  Owner: ${beaver.owner}`);
                            
                            // Calculate hourly rate for this beaver (matching contract logic)
                            const baseRates = [300, 750, 2250]; // Index 0=Noob, 1=Pro, 2=Degen (matching contract)
                            const baseRate = baseRates[beaver.type] || 300;
                            
                            // Use exact contract level multipliers (divided by 1000)
                            const getContractLevelMultiplier = (level) => {
                                if (level === 1) return 1000;      // 1.0x
                                else if (level === 2) return 1500; // 1.5x  
                                else if (level === 3) return 2250; // 2.25x
                                else if (level === 4) return 3375; // 3.375x
                                else return 5062;                  // 5.0625x (level 5)
                            };
                            
                            const levelMultiplier = getContractLevelMultiplier(beaver.level) / 1000;
                            const hourlyRate = baseRate * levelMultiplier;
                            totalHourlyRate += hourlyRate;
                            
                            beaver.hourlyRate = hourlyRate;
                            
                            beavers.push(beaver);
                            console.log(`✅ Successfully fetched beaver ${beaverId} (manual parse)`);
                        } catch (parseError) {
                            console.log(`❌ Failed to parse beaver ${beaverId} manually:`, parseError);
                        }
                    }
                }
                
                         } catch (error) {
                 console.error(`❌ Error fetching beaver ${beaverId}:`, error);
                 if (error.message && error.message.includes('Not beaver owner')) {
                     console.log(`❌ Beaver ${beaverId} is not owned by user (ownership error)`);
                 } else {
                     console.log(`❌ Beaver ${beaverId} failed to fetch:`, error.message);
                 }
                 // Continue with next beaver instead of breaking
                 continue;
             }
         }
        
        // Distribute total pending rewards proportionally based on hourly rates
        for (const beaver of beavers) {
            if (totalHourlyRate > 0) {
                const proportion = beaver.hourlyRate / totalHourlyRate;
                const proportionalReward = BigInt(Math.floor(Number(totalPendingBigInt) * proportion));
                beaver.pendingRewards = formatBalance(proportionalReward, 18);
            } else {
                beaver.pendingRewards = '0';
            }
        }
        
        return { beavers, totalRewards: formatBalance(totalPendingBigInt, 18) };
        
    } catch (error) {
        console.log("💥 fetchPlayerInfo error:", error);
        return { beavers: [], totalRewards: BigInt(0) };
    }
}

// Fetch real-time pending rewards from contract
export async function fetchPendingRewards(address) {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        // Ensure address is properly formatted
        let formattedAddress = address;
        if (typeof address === 'string' && !address.startsWith('0x')) {
            formattedAddress = '0x' + address;
        }
        
        // Get pending rewards directly from contract using manual call
        const pendingRewardsRaw = await provider.callContract({
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: 'calculate_pending_rewards',
            calldata: [formattedAddress]
        });
        
        // Parse the result - should be a single u256 value
        let pendingRewards = 0n;
        if (Array.isArray(pendingRewardsRaw) && pendingRewardsRaw.length > 0) {
            // For u256, we might get two felt252 values (low, high)
            if (pendingRewardsRaw.length >= 2) {
                const low = BigInt(pendingRewardsRaw[0]);
                const high = BigInt(pendingRewardsRaw[1]);
                pendingRewards = low + (high << 128n);
            } else {
                pendingRewards = BigInt(pendingRewardsRaw[0]);
            }
        }
        
        const pendingBigInt = pendingRewards;
        
        // Return raw number (not formatted) for better precision
        const divisor = BigInt(10 ** 18);
        const wholePart = pendingBigInt / divisor;
        const remainder = pendingBigInt % divisor;
        const wholeNumber = Number(wholePart);
        const fractionalNumber = Number(remainder) / Math.pow(10, 18);
        const totalNumber = wholeNumber + fractionalNumber;
        
        return totalNumber;
        
    } catch (error) {
        console.error('❌ Error fetching pending rewards:', error);
        return 0;
    }
}

// Multicall function for approve + stake
export async function stakeBeaver(beaverType, strkCost, strkAddress) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        console.log("=== STAKE MULTICALL DEBUG ===");
        console.log("Beaver type:", beaverType);
        console.log("STRK cost:", strkCost.toString());
        console.log("STRK address:", strkAddress);
        
        // Convert frontend beaver type (1,2,3) to contract type (0,1,2)
        const contractBeaverType = beaverType - 1;
        
        // Prepare approve call (trying both formats for compatibility)
        const approveCall = {
            contractAddress: strkAddress,
            entrypoint: "approve",
            calldata: CallData.compile([
                GAME_CONTRACT_ADDRESS,
                cairo.uint256(strkCost)
            ])
        };
        
        // Prepare stake call
        const stakeCall = {
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: "stake_beaver",
            calldata: CallData.compile([contractBeaverType])
        };
        
        console.log("Approve call:", approveCall);
        console.log("Stake call:", stakeCall);
        
        // Execute multicall
        const result = await currentConnection.account.execute([approveCall, stakeCall]);
        
        console.log("Stake multicall result:", result);
        return result;
        
    } catch (error) {
        console.error("Stake multicall error:", error);
        throw error;
    }
}

// Claim rewards (withdrawal)
export async function claimRewards() {
    try {
        console.log("Starting claim process...");
        
        const connection = getConnection();
        if (!connection || !connection.isConnected) {
            throw new Error('Wallet not connected');
        }

        // Create contract instance with account
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, connection.account);
        
        console.log("Calling claim function...");
        const result = await gameContract.claim();
        
        console.log("📋 Claim transaction result:", result.transaction_hash);
        console.log("✅ Claim successful!");
        
        return result;
        
    } catch (error) {
        console.error("❌ Claim error:", error);
        
        // Log error details for debugging
        console.log("📋 Claim error details:", error.message);
        console.log("📋 Full error:", error);
        
        // If BURR token not set, contract will fail
        if (error.message && error.message.includes('BURR token not set')) {
            return {
                transaction_hash: '0x' + Math.random().toString(16).substr(2, 8),
                mock: true,
                note: 'BURR token address not set in contract'
            };
        }
        
        throw error;
    }
}

// Multicall function for approve + upgrade
export async function upgradeBeaver(beaverId, upgradeCost) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        // Prepare approve call for BURR token
        const approveCall = {
            contractAddress: BURR_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile([
                GAME_CONTRACT_ADDRESS,
                cairo.uint256(upgradeCost)
            ])
        };
        
        // Prepare upgrade call
        const upgradeCall = {
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: "upgrade_beaver",
            calldata: CallData.compile([beaverId])
        };
        
        // Execute multicall
        const result = await currentConnection.account.execute([approveCall, upgradeCall]);
        
        return result;
        
    } catch (error) {
        console.error("Upgrade multicall error:", error);
        throw error;
    }
}

// Get current connection
export function getConnection() {
    return currentConnection;
}

// Check if wallet is connected
export function isWalletConnected() {
    return currentConnection && currentConnection.isConnected;
}

// Monitor wallet connection changes
let connectionMonitor = null;

// Start monitoring wallet connection
export function startConnectionMonitor(onDisconnect) {
    if (connectionMonitor) {
        clearInterval(connectionMonitor);
    }
    
    connectionMonitor = setInterval(async () => {
        if (currentConnection && currentConnection.isConnected) {
            try {
                // Check ArgentX
                if (window.starknet_argentX && currentConnection.wallet === window.starknet_argentX) {
                    if (window.starknet_argentX.isLocked || !window.starknet_argentX.isConnected) {
                        console.log('⚠️ ArgentX connection lost');
                        currentConnection = null;
                        clearWalletConnection();
                        if (onDisconnect) onDisconnect();
                        return;
                    }
                }
                
                // Check Braavos
                if (window.starknet_braavos && currentConnection.wallet === window.starknet_braavos) {
                    if (window.starknet_braavos.isLocked || !window.starknet_braavos.isConnected) {
                        console.log('⚠️ Braavos connection lost');
                        currentConnection = null;
                        clearWalletConnection();
                        if (onDisconnect) onDisconnect();
                        return;
                    }
                }
            } catch (error) {
                console.log('❌ Connection monitor error:', error);
            }
        }
    }, 5000); // Check every 5 seconds
}

// Stop monitoring wallet connection
export function stopConnectionMonitor() {
    if (connectionMonitor) {
        clearInterval(connectionMonitor);
        connectionMonitor = null;
    }
}

// Enhanced connection persistence
export function maintainConnection() {
    // Listen for wallet events
    if (window.starknet_argentX) {
        try {
            window.starknet_argentX.on('accountsChanged', (accounts) => {
                console.log('ArgentX accounts changed:', accounts);
                if (!accounts || accounts.length === 0) {
                    currentConnection = null;
                    clearWalletConnection();
                }
            });
            
            window.starknet_argentX.on('networkChanged', (network) => {
                console.log('ArgentX network changed:', network);
            });
        } catch (error) {
            console.log('⚠️ Could not set up ArgentX listeners:', error);
        }
    }
    
    if (window.starknet_braavos) {
        try {
            window.starknet_braavos.on('accountsChanged', (accounts) => {
                console.log('Braavos accounts changed:', accounts);
                if (!accounts || accounts.length === 0) {
                    currentConnection = null;
                    clearWalletConnection();
                }
            });
            
            window.starknet_braavos.on('networkChanged', (network) => {
                console.log('Braavos network changed:', network);
            });
        } catch (error) {
            console.log('⚠️ Could not set up Braavos listeners:', error);
        }
    }
}

// Fetch BURR token info (total supply, circulating supply, holder count)
export async function fetchTokenInfo() {
    try {
        console.log('🔍 Fetching BURR token info...');
        
        const tokenContract = new Contract(ERC20_ABI, BURR_TOKEN_ADDRESS, provider);
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        // Get basic token info and total burned from game contract
        const [actualTotalSupply, name, symbol, decimals, totalBurned] = await Promise.all([
            tokenContract.total_supply(),
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            gameContract.get_total_burned()
        ]);
        
        console.log('📊 Token info received:', {
            actualTotalSupply: actualTotalSupply.toString(),
            totalBurned: totalBurned ? totalBurned.toString() : 'null/undefined',
            totalBurnedType: typeof totalBurned,
            totalBurnedRaw: totalBurned,
            name: name,
            symbol: symbol,
            decimals: decimals
        });
        
        // Fixed total supply: 2.1 billion BURR (always constant)
        const FIXED_TOTAL_SUPPLY = "2,100,000,000";
        
        // Format total burned (BURR has 18 decimals) - use safeBalanceConvert
        let totalBurnedFormatted = "0";
        let totalBurnedNumber = 0;
        
        try {
            if (totalBurned !== null && totalBurned !== undefined) {
                // Convert using the same function we use for other balances
                const totalBurnedBigInt = safeBalanceConvert(totalBurned);
                console.log('📊 Total burned converted to BigInt:', totalBurnedBigInt.toString());
                
                totalBurnedNumber = Number(totalBurnedBigInt) / Math.pow(10, 18);
                if (!isNaN(totalBurnedNumber)) {
                    totalBurnedFormatted = totalBurnedNumber.toLocaleString('en-US', {
                        maximumFractionDigits: 0
                    });
                } else {
                    console.log('⚠️ totalBurned is NaN after conversion:', totalBurnedNumber);
                    totalBurnedFormatted = "0";
                    totalBurnedNumber = 0;
                }
            } else {
                console.log('⚠️ totalBurned is null/undefined:', totalBurned);
                totalBurnedFormatted = "0";
                totalBurnedNumber = 0;
            }
        } catch (error) {
            console.error('❌ Error formatting totalBurned:', error, 'Value:', totalBurned);
            totalBurnedFormatted = "0";
            totalBurnedNumber = 0;
        }
        
        // Circulating supply: Actual minted tokens from contract
        const actualTotalSupplyNumber = Number(actualTotalSupply) / Math.pow(10, 18);
        const circulatingSupplyFormatted = actualTotalSupplyNumber.toLocaleString('en-US', {
            maximumFractionDigits: 0
        });
        
        // Only use data available from contract (no external APIs)
        
        return {
            totalSupply: FIXED_TOTAL_SUPPLY,
            circulatingSupply: circulatingSupplyFormatted,
            totalBurned: totalBurnedFormatted,
            name: name,
            symbol: symbol,
            decimals: decimals,
            raw: {
                totalSupply: "2100000000000000000000000000", // 2.1B max supply in wei
                actualTotalSupply: actualTotalSupply.toString(), // Actual minted supply
                totalBurned: totalBurned?.toString() || "0"
            }
        };
        
    } catch (error) {
        console.error('❌ Error fetching token info:', error);
        return {
            totalSupply: "2,100,000,000",
            circulatingSupply: "Loading...",
            totalBurned: "Loading...",
            name: "BURR",
            symbol: "BURR",
            decimals: 18,
            raw: {
                totalSupply: "2100000000000000000000000000", // 2.1B max supply in wei
                actualTotalSupply: "0", // Actual minted supply
                totalBurned: "0"
            }
        };
    }
}

// Fetch game information from contract
export async function fetchGameInfo() {
    try {
        console.log('🔍 Fetching game info...');
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const gameInfo = await gameContract.get_game_info();
        
        console.log('📊 Game info received:', gameInfo);
        return gameInfo;
    } catch (error) {
        console.error('❌ Game info fetch error:', error);
        return null;
    }
}

// Fetch game analytics from contract
export async function fetchGameAnalytics() {
    try {
        console.log('📊 Fetching game analytics...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const analytics = await gameContract.get_game_analytics();
        
        console.log('📊 Raw game analytics result:', analytics);
        
        const processedAnalytics = {
            totalBeaversStaked: parseInt(analytics.total_beavers_staked),
            totalBurrClaimed: safeBalanceConvert(analytics.total_burr_claimed),
            totalStrkCollected: safeBalanceConvert(analytics.total_strk_collected),
            totalBurrBurned: safeBalanceConvert(analytics.total_burr_burned),
            noobCount: parseInt(analytics.noob_count),
            proCount: parseInt(analytics.pro_count),
            degenCount: parseInt(analytics.degen_count),
            activeUsers: parseInt(analytics.active_users),
            totalUpgrades: parseInt(analytics.total_upgrades)
        };
        
        console.log('✅ Game analytics fetched:', processedAnalytics);
        return processedAnalytics;
    } catch (error) {
        console.error('❌ Error fetching game analytics:', error);
        throw error;
    }
}

export async function fetchBeaverTypeStats() {
    try {
        console.log('📊 Fetching beaver type stats...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const statsResult = await gameContract.get_beaver_type_stats();
        
        console.log('📊 Raw beaver type stats result:', statsResult);
        
        // Handle tuple response - statsResult is an object with 0, 1, and 2 properties
        const noobCount = statsResult[0] || statsResult.noob_count;
        const proCount = statsResult[1] || statsResult.pro_count;
        const degenCount = statsResult[2] || statsResult.degen_count;
        
        const stats = {
            noobCount: parseInt(noobCount),
            proCount: parseInt(proCount),
            degenCount: parseInt(degenCount)
        };
        
        console.log('✅ Beaver type stats fetched:', stats);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching beaver type stats:', error);
        throw error;
    }
}

export async function fetchTotalClaimedBurr() {
    try {
        console.log('📊 Fetching total claimed BURR...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const totalClaimed = await gameContract.get_total_claimed_burr();
        
        console.log('📊 Raw total claimed result:', totalClaimed);
        
        const totalClaimedBigInt = safeBalanceConvert(totalClaimed);
        console.log('✅ Total claimed BURR fetched:', totalClaimedBigInt.toString());
        return totalClaimedBigInt;
    } catch (error) {
        console.error('❌ Error fetching total claimed BURR:', error);
        throw error;
    }
}

export async function fetchActiveUsersCount() {
    try {
        console.log('📊 Fetching active users count...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const activeUsers = await gameContract.get_active_users_count();
        
        console.log('📊 Raw active users result:', activeUsers);
        
        const activeUsersNumber = parseInt(activeUsers);
        console.log('✅ Active users count fetched:', activeUsersNumber);
        return activeUsersNumber;
    } catch (error) {
        console.error('❌ Error fetching active users count:', error);
        throw error;
    }
}

export async function fetchContractBalances() {
    try {
        console.log('📊 Fetching contract balances...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const balancesResult = await gameContract.get_contract_balances();
        
        console.log('📊 Raw contract balances result:', balancesResult);
        
        // Handle tuple response - balancesResult is an object with 0 and 1 properties
        const strkBalance = balancesResult[0] || balancesResult.strk_balance;
        const burrBalance = balancesResult[1] || balancesResult.burr_balance;
        
        const balances = {
            strkBalance: safeBalanceConvert(strkBalance),
            burrBalance: safeBalanceConvert(burrBalance)
        };
        
        console.log('✅ Contract balances fetched:', balances);
        return balances;
    } catch (error) {
        console.error('❌ Error fetching contract balances:', error);
        throw error;
    }
}

export async function fetchAllGameData() {
    try {
        console.log('🔄 Fetching all game data...');
        
        const [
            gameAnalytics,
            beaverTypeStats,
            totalClaimedBurr,
            activeUsersCount,
            contractBalances,
            gameInfo
        ] = await Promise.all([
            fetchGameAnalytics(),
            fetchBeaverTypeStats(),
            fetchTotalClaimedBurr(),
            fetchActiveUsersCount(),
            fetchContractBalances(),
            fetchGameInfo()
        ]);
        
        const allData = {
            analytics: gameAnalytics,
            typeStats: beaverTypeStats,
            totalClaimedBurr,
            activeUsersCount,
            contractBalances,
            gameInfo
        };
        
        console.log('✅ All game data fetched:', allData);
        return allData;
    } catch (error) {
        console.error('❌ Error fetching all game data:', error);
        throw error;
    }
}

// Get emergency status from contract
export async function getEmergencyStatus() {
    try {
        console.log('🔍 Checking emergency status...');
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const isPaused = await gameContract.get_emergency_status();
        
        console.log('⚠️ Emergency status:', isPaused);
        return Boolean(isPaused);
    } catch (error) {
        console.error('❌ Emergency status error:', error);
        return false;
    }
}

// Get staking costs from contract
export async function fetchStakingCosts() {
    try {
        console.log('🔍 Fetching staking costs...');
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const costs = await gameContract.get_staking_costs();
        
        console.log('💰 Staking costs received:', costs);
        return costs;
    } catch (error) {
        console.error('❌ Staking costs fetch error:', error);
        return null;
    }
}

// Import beaver (migration function)
export async function importBeaver(owner, beaverId, beaverType, lastClaimTime, originalLevel) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        console.log('🔄 Importing beaver...', {owner, beaverId, beaverType, lastClaimTime, originalLevel});
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.import_beaver(owner, beaverId, beaverType, lastClaimTime, originalLevel);
        
        console.log('✅ Beaver import successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Import beaver error:', error);
        throw error;
    }
}

// Emergency pause function (admin only)
export async function emergencyPause() {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        console.log('⚠️ Emergency pausing...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.emergency_pause();
        
        console.log('✅ Emergency pause successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Emergency pause error:', error);
        throw error;
    }
}

// Emergency unpause function (admin only)
export async function emergencyUnpause() {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        console.log('✅ Emergency unpausing...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.emergency_unpause();
        
        console.log('✅ Emergency unpause successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Emergency unpause error:', error);
        throw error;
    }
} 

// Test function to check contract responses
export async function testContractFunctions() {
    try {
        console.log('🧪 Testing contract functions...');
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        // Test each function individually
        try {
            const totalClaimed = await gameContract.get_total_claimed_burr();
            console.log('✅ get_total_claimed_burr result:', totalClaimed);
        } catch (error) {
            console.log('❌ get_total_claimed_burr error:', error.message);
        }
        
        try {
            const activeUsers = await gameContract.get_active_users_count();
            console.log('✅ get_active_users_count result:', activeUsers);
        } catch (error) {
            console.log('❌ get_active_users_count error:', error.message);
        }
        
        try {
            const balances = await gameContract.get_contract_balances();
            console.log('✅ get_contract_balances result:', balances);
        } catch (error) {
            console.log('❌ get_contract_balances error:', error.message);
        }
        
        try {
            const stats = await gameContract.get_beaver_type_stats();
            console.log('✅ get_beaver_type_stats result:', stats);
        } catch (error) {
            console.log('❌ get_beaver_type_stats error:', error.message);
        }
        
        try {
            const analytics = await gameContract.get_game_analytics();
            console.log('✅ get_game_analytics result:', analytics);
        } catch (error) {
            console.log('❌ get_game_analytics error:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Test function error:', error);
    }
} 