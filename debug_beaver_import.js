const { RpcProvider, Contract } = require('starknet');

// Initialize provider
const provider = new RpcProvider({
    nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA"
});

// Game contract address
const GAME_CONTRACT_ADDRESS = "0x0138cb7150f311b40163cf4cb4e1be38b795c232ef27c50cdf30b166bec36c27";

// User address
const USER_ADDRESS = "0x1cea635ebd5fcf9e6f95fe8ff43dd54856d30a45926586753b47899ed36d6cf";

async function debugBeaverOwnership() {
    try {
        console.log("🔍 Debugging beaver ownership...");
        
        // Get user beavers
        const userBeaversResult = await provider.callContract({
            contractAddress: GAME_CONTRACT_ADDRESS,
            entrypoint: 'get_user_beavers',
            calldata: [USER_ADDRESS]
        });
        
        console.log("📊 User beavers:", userBeaversResult);
        
        // Try to get beaver #2 with different address formats
        const addressVariations = [
            USER_ADDRESS,
            USER_ADDRESS.toLowerCase(),
            USER_ADDRESS.toUpperCase(),
            USER_ADDRESS.replace(/^0x0+/, '0x'),
            USER_ADDRESS.startsWith('0x') ? USER_ADDRESS : '0x' + USER_ADDRESS,
            USER_ADDRESS.toLowerCase().replace(/^0x0+/, '0x')
        ];
        
        console.log("🔄 Testing different address formats for beaver #2:");
        
        for (const address of addressVariations) {
            try {
                const beaverResult = await provider.callContract({
                    contractAddress: GAME_CONTRACT_ADDRESS,
                    entrypoint: 'get_beaver',
                    calldata: [address, 2]
                });
                
                console.log(`✅ Success with address: ${address}`);
                console.log("Beaver #2 details:", beaverResult);
                break;
                
            } catch (error) {
                console.log(`❌ Failed with address: ${address} - ${error.message}`);
            }
        }
        
        // Try to get beaver #66 and #1 for comparison
        console.log("\n🔄 Testing beaver #66:");
        try {
            const beaver66Result = await provider.callContract({
                contractAddress: GAME_CONTRACT_ADDRESS,
                entrypoint: 'get_beaver',
                calldata: [USER_ADDRESS, 66]
            });
            console.log("Beaver #66 details:", beaver66Result);
        } catch (error) {
            console.log("❌ Beaver #66 error:", error.message);
        }
        
        console.log("\n🔄 Testing beaver #1:");
        try {
            const beaver1Result = await provider.callContract({
                contractAddress: GAME_CONTRACT_ADDRESS,
                entrypoint: 'get_beaver',
                calldata: [USER_ADDRESS, 1]
            });
            console.log("Beaver #1 details:", beaver1Result);
        } catch (error) {
            console.log("❌ Beaver #1 error:", error.message);
        }
        
        // Try to find the actual owner of beaver #2 by trying common address variations
        console.log("\n🔍 Trying to find beaver #2's actual owner:");
        
        // Common address variations that might have been used during import
        const possibleOwners = [
            USER_ADDRESS,
            USER_ADDRESS.toLowerCase(),
            USER_ADDRESS.toUpperCase(),
            USER_ADDRESS.replace(/^0x0+/, '0x'),
            USER_ADDRESS.startsWith('0x') ? USER_ADDRESS : '0x' + USER_ADDRESS,
            USER_ADDRESS.toLowerCase().replace(/^0x0+/, '0x'),
            // Try without leading zeros
            USER_ADDRESS.replace(/^0x0+/, '0x'),
            // Try with different case
            USER_ADDRESS.toLowerCase(),
            USER_ADDRESS.toUpperCase(),
            // Try with and without 0x prefix
            USER_ADDRESS.startsWith('0x') ? USER_ADDRESS.slice(2) : USER_ADDRESS,
            USER_ADDRESS.startsWith('0x') ? USER_ADDRESS : '0x' + USER_ADDRESS
        ];
        
        for (const owner of possibleOwners) {
            try {
                const beaver2Result = await provider.callContract({
                    contractAddress: GAME_CONTRACT_ADDRESS,
                    entrypoint: 'get_beaver',
                    calldata: [owner, 2]
                });
                
                console.log(`✅ Found beaver #2 owner: ${owner}`);
                console.log("Beaver #2 details:", beaver2Result);
                break;
                
            } catch (error) {
                // Silently continue - this is expected for most attempts
            }
        }
        
    } catch (error) {
        console.error("❌ Debug error:", error);
    }
}

debugBeaverOwnership(); 