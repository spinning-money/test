/* eslint-env es2020 */
/* global BigInt */
import { connect, disconnect } from "starknetkit";
import { Contract, CallData, cairo, RpcProvider } from "starknet";
import { GAME_CONTRACT_ADDRESS, BURR_TOKEN_ADDRESS, STRK_ADDRESSES, CURRENT_NETWORK, NETWORKS } from './constants.js';

// Ensure BigInt is available
if (typeof BigInt === 'undefined') {
    throw new Error('BigInt is not supported in this browser');
}

// RPC URLs
const RPC_URLS = {
    [NETWORKS.MAINNET]: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA",
    [NETWORKS.SEPOLIA]: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA"
};

const provider = new RpcProvider({
    nodeUrl: RPC_URLS[CURRENT_NETWORK]
});

// Simple ABI definitions
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
            {"name": "total_burr_claimed_low", "type": "felt"},
            {"name": "total_burr_claimed_high", "type": "felt"},
            {"name": "total_strk_collected_low", "type": "felt"},
            {"name": "total_strk_collected_high", "type": "felt"},
            {"name": "total_burr_burned_low", "type": "felt"},
            {"name": "total_burr_burned_high", "type": "felt"},
            {"name": "noob_count", "type": "felt"},
            {"name": "pro_count", "type": "felt"},
            {"name": "degen_count", "type": "felt"},
            {"name": "active_users", "type": "felt"},
            {"name": "total_upgrades", "type": "felt"}
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

// LocalStorage keys
const WALLET_STORAGE_KEY = 'burrow_wallet_connection';
const WALLET_ADDRESS_KEY = 'burrow_wallet_address';

// Save wallet connection
function saveWalletConnection(connection) {
    try {
        if (connection && connection.isConnected && connection.account?.address) {
            localStorage.setItem(WALLET_STORAGE_KEY, 'true');
            localStorage.setItem(WALLET_ADDRESS_KEY, connection.account.address);
        }
    } catch (error) {
        console.log('Failed to save wallet connection:', error);
    }
}

// Clear wallet connection
function clearWalletConnection() {
    try {
        localStorage.removeItem(WALLET_STORAGE_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
    } catch (error) {
        console.log('Failed to clear wallet connection:', error);
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

// Auto-reconnect wallet
export async function autoReconnectWallet() {
    if (!wasWalletConnected()) {
        return { isConnected: false, autoReconnect: false };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        if (!window.starknet_argentX && !window.starknet_braavos && !window.starknet) {
            clearWalletConnection();
            return { isConnected: false, autoReconnect: false };
        }

        // Try ArgentX first
        if (window.starknet_argentX) {
            try {
                const wallet = window.starknet_argentX;
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (!wallet.isConnected) {
                    await wallet.enable({ showModal: false });
                }
                
                if (!wallet.isLocked && wallet.isConnected && wallet.account?.address) {
                    currentConnection = {
                        account: wallet.account,
                        wallet: wallet,
                        isConnected: true
                    };
                    
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
                console.log('ArgentX auto-reconnect failed:', error.message);
            }
        }

        // Try Braavos
        if (window.starknet_braavos) {
            try {
                const wallet = window.starknet_braavos;
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (!wallet.isConnected) {
                    await wallet.enable({ showModal: false });
                }
                
                if (!wallet.isLocked && wallet.isConnected && wallet.account?.address) {
                    currentConnection = {
                        account: wallet.account,
                        wallet: wallet,
                        isConnected: true
                    };
                    
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
                console.log('Braavos auto-reconnect failed:', error.message);
            }
        }

        // Try Starknetkit
        try {
            const connection = await connect({
                webWalletUrl: "https://web.argent.xyz",
                dappName: "BurrowGame",
                modalMode: "neverAsk",
                modalTheme: "dark",
                include: ["argentX", "braavos"],
                exclude: [],
                order: ["argentX", "braavos"]
            });

            if (connection && connection.isConnected && connection.account?.address) {
                currentConnection = connection;
                return {
                    wallet: connection.wallet,
                    account: connection.account,
                    address: connection.account.address,
                    isConnected: true,
                    autoReconnect: true
                };
            }
        } catch (error) {
            console.log("Starknetkit auto-reconnect failed:", error.message);
        }

        clearWalletConnection();
        return { isConnected: false, autoReconnect: false };

    } catch (error) {
        console.error('Auto-reconnect error:', error);
        clearWalletConnection();
        return { isConnected: false, autoReconnect: false };
    }
}

// Safe balance conversion
function safeBalanceConvert(balance) {
    try {
        if (!balance) return BigInt(0);
        
        if (typeof balance === 'object') {
            if (balance.balance !== undefined) {
                return BigInt(balance.balance);
            }
            
            if (balance.low !== undefined && balance.high !== undefined) {
                return BigInt(balance.low) + (BigInt(balance.high) << BigInt(128));
            }
            
            if (Array.isArray(balance) && balance.length >= 2) {
                return BigInt(balance[0]) + (BigInt(balance[1]) << BigInt(128));
            }
            
            if (Array.isArray(balance) && balance.length === 1) {
                return BigInt(balance[0]);
            }
            
            for (let key in balance) {
                const value = balance[key];
                if (typeof value === 'number' || typeof value === 'bigint') {
                    return BigInt(value);
                }
                if (typeof value === 'string' && /^\d+$/.test(value)) {
                    return BigInt(value);
                }
            }
            
            return BigInt(0);
        }
        
        if (typeof balance === 'string') {
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

// Format balance for display
function formatBalance(balance, decimals = 18) {
    try {
        const balanceBigInt = typeof balance === 'bigint' ? balance : BigInt(balance);
        const divisor = BigInt(10 ** decimals);
        
        const wholePart = balanceBigInt / divisor;
        const remainder = balanceBigInt % divisor;
        
        const wholeNumber = Number(wholePart);
        const fractionalNumber = Number(remainder) / Math.pow(10, decimals);
        const totalNumber = wholeNumber + fractionalNumber;
        
        return formatNumber(totalNumber);
    } catch (error) {
        console.log('Format balance error:', error);
        return '0';
    }
}

// Format number
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
        if (!window.starknet_argentX && !window.starknet_braavos && !window.starknet) {
            throw new Error('No Starknet wallets found. Please install ArgentX or Braavos wallet extension.');
        }

        // Try Starknetkit modal first
        try {
            const connection = await connect({
                webWalletUrl: "https://web.argent.xyz",
                dappName: "BurrowGame",
                modalMode: "alwaysAsk",
                modalTheme: "dark",
                include: ["argentX", "braavos"],
                exclude: [],
                order: ["argentX", "braavos"]
            });

            if (connection && connection.isConnected && connection.account?.address) {
                currentConnection = connection;
                saveWalletConnection(connection);
                
                return {
                    wallet: connection.wallet,
                    account: connection.account,
                    address: connection.account.address,
                    isConnected: true
                };
            }
        } catch (error) {
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
            console.log("Starknetkit modal failed:", error.message);
        }

        // Try direct connections
        if (window.starknet_argentX) {
            try {
                const wallet = window.starknet_argentX;
                
                if (!wallet.isLocked) {
                    await wallet.enable();
                    
                    if (wallet.isConnected && wallet.account?.address) {
                        currentConnection = {
                            account: wallet.account,
                            wallet: wallet,
                            isConnected: true
                        };
                        
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
                console.log("Direct ArgentX connection failed:", error.message);
            }
        }

        if (window.starknet_braavos) {
            try {
                const wallet = window.starknet_braavos;
                
                if (!wallet.isLocked) {
                    await wallet.enable();
                    
                    if (wallet.isConnected && wallet.account?.address) {
                        currentConnection = {
                            account: wallet.account,
                            wallet: wallet,
                            isConnected: true
                        };
                        
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
                console.log("Direct Braavos connection failed:", error.message);
            }
        }

        return { 
            isConnected: false, 
            error: null
        };

    } catch (error) {
        console.error("Wallet connection error:", error);
        
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
        clearWalletConnection();
        return { isConnected: false };
    } catch (error) {
        console.error("Wallet disconnect error:", error);
        clearWalletConnection();
        return { isConnected: false };
    }
}

// Get balances
export async function fetchBalances(address) {
    let burrBalance = BigInt(0);
    let strkBalance = BigInt(0);
    let workingStrkAddress = null;
    
    // Fetch BURR balance
    try {
        const burrContract = new Contract(ERC20_ABI, BURR_TOKEN_ADDRESS, provider);
        const burrResult = await burrContract.balance_of(address);
        burrBalance = safeBalanceConvert(burrResult);
    } catch (error) {
        console.log("BURR balance error:", error);
    }
    
    // Try each STRK address
    for (const strkAddr of STRK_ADDRESSES) {
        try {
            const strkContract = new Contract(ERC20_ABI, strkAddr, provider);
            const strkResult = await strkContract.balance_of(address);
            const balance = safeBalanceConvert(strkResult);
            
            if (balance > BigInt(0)) {
                strkBalance = balance;
                workingStrkAddress = strkAddr;
                break;
            }
        } catch (error) {
            console.log(`STRK error for ${strkAddr}:`, error.message);
        }
    }
    
    return {
        burrBalance,
        strkBalance,
        workingStrkAddress,
        burrFormatted: formatBalance(burrBalance, 18),
        strkFormatted: formatBalance(strkBalance, 18)
    };
}

// NEW SIMPLE fetchPlayerInfo function
export async function fetchPlayerInfo(address) {
    try {
        console.log("🔍 fetchPlayerInfo called with address:", address);
        
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        // Format address
        let formattedAddress = address;
        if (typeof address === 'string' && !address.startsWith('0x')) {
            formattedAddress = '0x' + address;
        }
        
        // Get user beavers list
        const userBeaversResult = await provider.callContract({
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: 'get_user_beavers',
            calldata: [formattedAddress]
        });

        console.log('🔍 Raw get_user_beavers result:', userBeaversResult);

        // Parse beaver IDs
        let beaverIds = [];
        if (Array.isArray(userBeaversResult) && userBeaversResult.length > 0) {
            const uniqueIds = new Set();
            for (const id of userBeaversResult) {
                const numId = parseInt(id, 16);
                if (numId > 0 && numId < 1000000) {
                    uniqueIds.add(numId);
                }
            }
            beaverIds = Array.from(uniqueIds);
        }
        
        console.log('🦫 Parsed beaver IDs:', beaverIds);
        
        if (beaverIds.length === 0) {
            return { beavers: [], totalRewards: '0' };
        }
        
        // Get total pending rewards
        const totalPendingRewards = await gameContract.calculate_pending_rewards(formattedAddress);
        const totalPendingBigInt = safeBalanceConvert(totalPendingRewards);
        
        // Process each beaver - SIMPLE AND CLEAN
        const beavers = [];
        let totalHourlyRate = 0;
        
        // Import beaver detection logic
        const isImportedBeaver = (beaverId) => {
            // Import edilen beaver'lar genellikle yüksek ID'lere sahip
            // veya belirli aralıklarda olabilir
            return beaverId > 1000 || beaverId === 40 || beaverId === 35 || beaverId === 37 || beaverId === 41 || beaverId === 43 || beaverId === 45;
        };
        
        const getImportedBeaverType = (beaverId) => {
            // ID aralığına göre type belirleme
            if (beaverId >= 34950 && beaverId <= 34960) {
                return 2; // Degen (yüksek ID'li import'lar)
            }
            if (beaverId >= 1000 && beaverId <= 2000) {
                return 1; // Pro (orta ID'li import'lar)
            }
            if (beaverId >= 2000 && beaverId <= 10000) {
                return 2; // Degen (yüksek ID'li import'lar)
            }
            // Varsayılan olarak Degen
            return 2; // Degen
        };
        
        for (const beaverId of beaverIds) {
            console.log(`🦫 Processing beaver ${beaverId}`);
            
            // Default values
            let beaverType = 0; // Noob
            let beaverLevel = 1;
            let lastClaimTime = 0;
            
            // Check if this is an imported beaver
            if (isImportedBeaver(beaverId)) {
                console.log(`🔄 Imported beaver ${beaverId} detected`);
                beaverType = getImportedBeaverType(beaverId);
                beaverLevel = 1; // Default level for imported beavers
                console.log(`✅ Set imported beaver ${beaverId} to Type=${beaverType}, Level=${beaverLevel}`);
            }
            
            // Try to get beaver details from contract
            try {
                console.log(`🔍 Calling get_beaver for beaver ${beaverId} with address ${formattedAddress}`);
                
                const beaverResult = await provider.callContract({
                    contractAddress: GAME_CONTRACT_ADDRESS,
                    entrypoint: 'get_beaver',
                    calldata: [formattedAddress, beaverId.toString()]
                });
                
                console.log(`🔍 Raw beaver result for ${beaverId}:`, beaverResult);
                console.log(`🔍 Result structure:`, {
                    hasResult: !!beaverResult,
                    hasResultProperty: !!beaverResult?.result,
                    resultLength: beaverResult?.result?.length,
                    resultType: typeof beaverResult?.result
                });
                
                // Check if we got a valid result
                if (beaverResult && beaverResult.result && beaverResult.result.length >= 5) {
                    // Parse the result array - BOTH HEX AND DECIMAL PARSING
                    const rawType = beaverResult.result[1];
                    const rawLevel = beaverResult.result[2];
                    const rawLastClaim = beaverResult.result[3];
                    
                    console.log(`🔍 Raw values for beaver ${beaverId}:`, {
                        rawType,
                        rawLevel,
                        rawLastClaim
                    });
                    
                    // Comprehensive parsing for all formats
                    let parsedType, parsedLevel, parsedLastClaim;
                    let parsingMethod = 'unknown';
                    
                    // Method 1: Try decimal parsing first
                    parsedType = parseInt(rawType);
                    parsedLevel = parseInt(rawLevel);
                    parsedLastClaim = parseInt(rawLastClaim);
                    
                    if (!isNaN(parsedType) && !isNaN(parsedLevel)) {
                        parsingMethod = 'decimal';
                        console.log(`🔢 Using decimal parsing for beaver ${beaverId}`);
                    } else {
                        // Method 2: Try hex parsing
                        parsedType = parseInt(rawType, 16);
                        parsedLevel = parseInt(rawLevel, 16);
                        parsedLastClaim = parseInt(rawLastClaim, 16);
                        
                        if (!isNaN(parsedType) && !isNaN(parsedLevel)) {
                            parsingMethod = 'hex';
                            console.log(`🔍 Using hex parsing for beaver ${beaverId}`);
                        } else {
                            // Method 3: Try string parsing (remove 0x prefix if exists)
                            const cleanType = rawType.toString().replace('0x', '');
                            const cleanLevel = rawLevel.toString().replace('0x', '');
                            const cleanLastClaim = rawLastClaim.toString().replace('0x', '');
                            
                            parsedType = parseInt(cleanType, 16);
                            parsedLevel = parseInt(cleanLevel, 16);
                            parsedLastClaim = parseInt(cleanLastClaim, 16);
                            
                            if (!isNaN(parsedType) && !isNaN(parsedLevel)) {
                                parsingMethod = 'clean_hex';
                                console.log(`🧹 Using clean hex parsing for beaver ${beaverId}`);
                            } else {
                                // Method 4: Fallback to default values
                                parsedType = 0; // Default to Noob
                                parsedLevel = 1;
                                parsedLastClaim = 0;
                                parsingMethod = 'fallback';
                                console.log(`⚠️ All parsing methods failed for beaver ${beaverId}, using defaults`);
                            }
                        }
                    }
                    
                    beaverType = parsedType;
                    beaverLevel = parsedLevel;
                    lastClaimTime = parsedLastClaim;
                    
                    console.log(`✅ Parsed beaver ${beaverId}: Type=${beaverType}, Level=${beaverLevel}`);
                    console.log(`📊 Parsing method: ${parsingMethod}`);
                    console.log(`🔍 Raw values: Type="${rawType}", Level="${rawLevel}", LastClaim="${rawLastClaim}"`);
                } else {
                    console.log(`⚠️ Invalid beaver result for ${beaverId}, using defaults`);
                    console.log(`🔍 Result structure:`, beaverResult);
                }
            } catch (error) {
                console.log(`⚠️ Could not get details for beaver ${beaverId}, using defaults. Error:`, error.message);
                
                                    // Fallback to imported beaver detection
                    if (isImportedBeaver(beaverId)) {
                        console.log(`🔄 Imported beaver ${beaverId} detected`);
                        beaverType = getImportedBeaverType(beaverId);
                        beaverLevel = 1; // Default level for imported beavers
                        console.log(`✅ Set imported beaver ${beaverId} to Type=${beaverType}, Level=${beaverLevel}`);
                    } else {
                        // For any beaver that failed to parse, try to determine type based on ID
                        console.log(`🔄 Trying to determine type for beaver ${beaverId} based on ID`);
                        if (beaverId > 1000) {
                            beaverType = 2; // Likely Degen for high IDs
                            console.log(`✅ Set high ID beaver ${beaverId} to Type=2 (Degen)`);
                        } else if (beaverId > 100) {
                            beaverType = 1; // Likely Pro for medium IDs
                            console.log(`✅ Set medium ID beaver ${beaverId} to Type=1 (Pro)`);
                        } else {
                            beaverType = 0; // Default to Noob
                            console.log(`✅ Set low ID beaver ${beaverId} to Type=0 (Noob)`);
                        }
                    }
            }
            
            // Create beaver object
            const beaver = {
                id: beaverId,
                type: beaverType,
                level: beaverLevel,
                last_claim_time: lastClaimTime,
                owner: formattedAddress
            };
            
            // Calculate hourly rate based on type and level
            // Contract types: 0=Noob, 1=Pro, 2=Degen
            const baseRates = [300, 300, 750, 2250]; // Index 0=Noob, 1=Pro, 2=Degen
            const baseRate = baseRates[beaver.type] || 300;
            
            console.log(`💰 Beaver ${beaverId} rate calculation:`, {
                type: beaver.type,
                level: beaver.level,
                baseRate
            });
            
            const getContractLevelMultiplier = (level) => {
                if (level === 1) return 1000;      // 1.0x
                else if (level === 2) return 1500; // 1.5x  
                else if (level === 3) return 2250; // 2.25x
                else if (level === 4) return 3375; // 3.375x
                else return 5062;                  // 5.0625x (level 5)
            };
            
            const levelMultiplier = getContractLevelMultiplier(beaver.level) / 1000;
            beaver.hourlyRate = baseRate * levelMultiplier;
            
            beavers.push(beaver);
            totalHourlyRate += beaver.hourlyRate;
            
            console.log(`✅ Added beaver ${beaverId} (Type: ${beaver.type}, Level: ${beaver.level}, Rate: ${beaver.hourlyRate})`);
        }
        
        // Distribute total pending rewards proportionally
        for (const beaver of beavers) {
            if (totalHourlyRate > 0) {
                const proportion = beaver.hourlyRate / totalHourlyRate;
                const proportionalReward = BigInt(Math.floor(Number(totalPendingBigInt) * proportion));
                beaver.pendingRewards = formatBalance(proportionalReward, 18);
            } else {
                beaver.pendingRewards = '0';
            }
        }
        
        console.log(`📊 Final result: ${beavers.length} beavers, total hourly rate: ${totalHourlyRate}`);
        
        return { 
            beavers, 
            totalRewards: formatBalance(totalPendingBigInt, 18) 
        };
        
    } catch (error) {
        console.log("💥 fetchPlayerInfo error:", error);
        return { beavers: [], totalRewards: '0' };
    }
}

// Fetch pending rewards
export async function fetchPendingRewards(address) {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        let formattedAddress = address;
        if (typeof address === 'string' && !address.startsWith('0x')) {
            formattedAddress = '0x' + address;
        }
        
        const pendingRewardsRaw = await provider.callContract({
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: 'calculate_pending_rewards',
            calldata: [formattedAddress]
        });
        
        let pendingRewards = 0n;
        if (Array.isArray(pendingRewardsRaw) && pendingRewardsRaw.length > 0) {
            if (pendingRewardsRaw.length >= 2) {
                const low = BigInt(pendingRewardsRaw[0]);
                const high = BigInt(pendingRewardsRaw[1]);
                pendingRewards = low + (high << 128n);
            } else {
                pendingRewards = BigInt(pendingRewardsRaw[0]);
            }
        }
        
        const pendingBigInt = pendingRewards;
        const divisor = BigInt(10 ** 18);
        const wholePart = pendingBigInt / divisor;
        const remainder = pendingBigInt % divisor;
        const wholeNumber = Number(wholePart);
        const fractionalNumber = Number(remainder) / Math.pow(10, 18);
        const totalNumber = wholeNumber + fractionalNumber;
        
        return totalNumber;
        
    } catch (error) {
        console.error('Error fetching pending rewards:', error);
        return 0;
    }
}

// Stake beaver
export async function stakeBeaver(beaverType, strkCost, strkAddress) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        const contractBeaverType = beaverType - 1;
        
        const approveCall = {
            contractAddress: strkAddress,
            entrypoint: "approve",
            calldata: CallData.compile([
                GAME_CONTRACT_ADDRESS,
                cairo.uint256(strkCost)
            ])
        };
        
        const stakeCall = {
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: "stake_beaver",
            calldata: CallData.compile([contractBeaverType])
        };
        
        const result = await currentConnection.account.execute([approveCall, stakeCall]);
        return result;
        
    } catch (error) {
        console.error("Stake multicall error:", error);
        throw error;
    }
}

// Claim rewards
export async function claimRewards() {
    try {
        const connection = getConnection();
        if (!connection || !connection.isConnected) {
            throw new Error('Wallet not connected');
        }

        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, connection.account);
        const result = await gameContract.claim();
        
        return result;
        
    } catch (error) {
        console.error("Claim error:", error);
        throw error;
    }
}

// Upgrade beaver
export async function upgradeBeaver(beaverId, upgradeCost) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        const approveCall = {
            contractAddress: BURR_TOKEN_ADDRESS,
            entrypoint: "approve",
            calldata: CallData.compile([
                GAME_CONTRACT_ADDRESS,
                cairo.uint256(upgradeCost)
            ])
        };
        
        const upgradeCall = {
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: "upgrade_beaver",
            calldata: CallData.compile([beaverId])
        };
        
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

// Monitor wallet connection
let connectionMonitor = null;

export function startConnectionMonitor(onDisconnect) {
    if (connectionMonitor) {
        clearInterval(connectionMonitor);
    }
    
    connectionMonitor = setInterval(async () => {
        if (currentConnection && currentConnection.isConnected) {
            try {
                if (window.starknet_argentX && currentConnection.wallet === window.starknet_argentX) {
                    if (window.starknet_argentX.isLocked || !window.starknet_argentX.isConnected) {
                        currentConnection = null;
                        clearWalletConnection();
                        if (onDisconnect) onDisconnect();
                        return;
                    }
                }
                
                if (window.starknet_braavos && currentConnection.wallet === window.starknet_braavos) {
                    if (window.starknet_braavos.isLocked || !window.starknet_braavos.isConnected) {
                        currentConnection = null;
                        clearWalletConnection();
                        if (onDisconnect) onDisconnect();
                        return;
                    }
                }
            } catch (error) {
                console.log('Connection monitor error:', error);
            }
        }
    }, 5000);
}

export function stopConnectionMonitor() {
    if (connectionMonitor) {
        clearInterval(connectionMonitor);
        connectionMonitor = null;
    }
}

export function maintainConnection() {
    if (window.starknet_argentX) {
        try {
            window.starknet_argentX.on('accountsChanged', (accounts) => {
                if (!accounts || accounts.length === 0) {
                    currentConnection = null;
                    clearWalletConnection();
                }
            });
            
            window.starknet_argentX.on('networkChanged', (network) => {
                console.log('ArgentX network changed:', network);
            });
        } catch (error) {
            console.log('Could not set up ArgentX listeners:', error);
        }
    }
    
    if (window.starknet_braavos) {
        try {
            window.starknet_braavos.on('accountsChanged', (accounts) => {
                if (!accounts || accounts.length === 0) {
                    currentConnection = null;
                    clearWalletConnection();
                }
            });
            
            window.starknet_braavos.on('networkChanged', (network) => {
                console.log('Braavos network changed:', network);
            });
        } catch (error) {
            console.log('Could not set up Braavos listeners:', error);
        }
    }
}

// Fetch token info
export async function fetchTokenInfo() {
    try {
        const tokenContract = new Contract(ERC20_ABI, BURR_TOKEN_ADDRESS, provider);
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        
        const [actualTotalSupply, name, symbol, decimals, totalBurned] = await Promise.all([
            tokenContract.total_supply(),
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            gameContract.get_total_burned()
        ]);
        
        const FIXED_TOTAL_SUPPLY = "2,100,000,000";
        
        let totalBurnedFormatted = "0";
        let totalBurnedNumber = 0;
        
        try {
            if (totalBurned !== null && totalBurned !== undefined) {
                const totalBurnedBigInt = safeBalanceConvert(totalBurned);
                totalBurnedNumber = Number(totalBurnedBigInt) / Math.pow(10, 18);
                if (!isNaN(totalBurnedNumber)) {
                    totalBurnedFormatted = totalBurnedNumber.toLocaleString('en-US', {
                        maximumFractionDigits: 0
                    });
                } else {
                    totalBurnedFormatted = "0";
                    totalBurnedNumber = 0;
                }
            } else {
                totalBurnedFormatted = "0";
                totalBurnedNumber = 0;
            }
        } catch (error) {
            console.error('Error formatting totalBurned:', error, 'Value:', totalBurned);
            totalBurnedFormatted = "0";
            totalBurnedNumber = 0;
        }
        
        const actualTotalSupplyNumber = Number(actualTotalSupply) / Math.pow(10, 18);
        const circulatingSupplyFormatted = actualTotalSupplyNumber.toLocaleString('en-US', {
            maximumFractionDigits: 0
        });
        
        return {
            totalSupply: FIXED_TOTAL_SUPPLY,
            circulatingSupply: circulatingSupplyFormatted,
            totalBurned: totalBurnedFormatted,
            name: name,
            symbol: symbol,
            decimals: decimals,
            raw: {
                totalSupply: "2100000000000000000000000000",
                actualTotalSupply: actualTotalSupply.toString(),
                totalBurned: totalBurned?.toString() || "0"
            }
        };
        
    } catch (error) {
        console.error('Error fetching token info:', error);
        return {
            totalSupply: "2,100,000,000",
            circulatingSupply: "Loading...",
            totalBurned: "Loading...",
            name: "BURR",
            symbol: "BURR",
            decimals: 18,
            raw: {
                totalSupply: "2100000000000000000000000000",
                actualTotalSupply: "0",
                totalBurned: "0"
            }
        };
    }
}

// Fetch game info
export async function fetchGameInfo() {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const gameInfo = await gameContract.get_game_info();
        return gameInfo;
    } catch (error) {
        console.error('Game info fetch error:', error);
        return null;
    }
}

// Fetch game analytics
export async function fetchGameAnalytics() {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const rawAnalytics = await gameContract.get_game_analytics();
        
        if (!rawAnalytics || !Array.isArray(rawAnalytics) || rawAnalytics.length < 12) {
            return null;
        }
        
        const analytics = {
            total_beavers_staked: Number(rawAnalytics[0] || 0),
            total_burr_claimed: BigInt(rawAnalytics[1] || 0) + (BigInt(rawAnalytics[2] || 0) << 128n),
            total_strk_collected: BigInt(rawAnalytics[3] || 0) + (BigInt(rawAnalytics[4] || 0) << 128n),
            total_burr_burned: BigInt(rawAnalytics[5] || 0) + (BigInt(rawAnalytics[6] || 0) << 128n),
            noob_count: Number(rawAnalytics[7] || 0),
            pro_count: Number(rawAnalytics[8] || 0),
            degen_count: Number(rawAnalytics[9] || 0),
            active_users: Number(rawAnalytics[10] || 0),
            total_upgrades: Number(rawAnalytics[11] || 0)
        };
        
        return analytics;
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return null;
    }
}

// Get emergency status
export async function getEmergencyStatus() {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const isPaused = await gameContract.get_emergency_status();
        return Boolean(isPaused);
    } catch (error) {
        console.error('Emergency status error:', error);
        return false;
    }
}

// Get staking costs
export async function fetchStakingCosts() {
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, provider);
        const costs = await gameContract.get_staking_costs();
        return costs;
    } catch (error) {
        console.error('Staking costs fetch error:', error);
        return null;
    }
}

// Import beaver
export async function importBeaver(owner, beaverId, beaverType, lastClaimTime, originalLevel) {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.import_beaver(owner, beaverId, beaverType, lastClaimTime, originalLevel);
        return result;
    } catch (error) {
        console.error('Import beaver error:', error);
        throw error;
    }
}

// Emergency pause
export async function emergencyPause() {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.emergency_pause();
        return result;
    } catch (error) {
        console.error('Emergency pause error:', error);
        throw error;
    }
}

// Emergency unpause
export async function emergencyUnpause() {
    if (!currentConnection || !currentConnection.isConnected) {
        throw new Error("Wallet not connected");
    }
    
    try {
        const gameContract = new Contract(GAME_ABI, GAME_CONTRACT_ADDRESS, currentConnection.account);
        const result = await gameContract.emergency_unpause();
        return result;
    } catch (error) {
        console.error('Emergency unpause error:', error);
        throw error;
    }
} 