const { RpcProvider } = require("starknet");

// Eski kontrat adresi
const OLD_CONTRACT_ADDRESS = "0x0340b156113539f6f6a82723ca8f79c283a8c1868ecb0b8b815d4491a38b51bc";

// Test kullanıcı adresi (console loglarından aldığımız)
const TEST_USER_ADDRESS = "0x2ffbd13c38e9524cae9097b740d2a9da35fe933dffcc9e18cfad15386f4d171";

// RPC URL
const RPC_URL = "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA";

async function debugOldContract() {
    console.log("🔍 Debugging old contract data...");
    
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    
    try {
        // 1. Kontratın var olup olmadığını kontrol et
        console.log("\n1️⃣ Checking if contract exists...");
        console.log("✅ Contract address:", OLD_CONTRACT_ADDRESS);
        
        // 2. get_user_beavers fonksiyonunu çağır
        console.log("\n2️⃣ Calling get_user_beavers...");
        const userBeaversResult = await provider.callContract({
            contractAddress: OLD_CONTRACT_ADDRESS,
            entrypoint: 'get_user_beavers',
            calldata: [TEST_USER_ADDRESS]
        });
        
        console.log("📊 User beavers result:", userBeaversResult);
        console.log("📊 Result type:", typeof userBeaversResult);
        console.log("📊 Result is array:", Array.isArray(userBeaversResult));
        console.log("📊 Number of beavers:", Array.isArray(userBeaversResult) ? userBeaversResult.length : 0);
        
        if (Array.isArray(userBeaversResult) && userBeaversResult.length > 0) {
            console.log("\n3️⃣ Testing individual beaver data...");
            
            // Tüm beaver'ları test et
            const testBeaverIds = userBeaversResult;
            
            console.log(`\n🦫 Testing ${testBeaverIds.length} beavers...`);
            
            for (let i = 0; i < testBeaverIds.length; i++) {
                const rawBeaverId = testBeaverIds[i];
                const beaverId = parseInt(rawBeaverId, 16);
                console.log(`\n🦫 Testing beaver ${beaverId} (raw: ${rawBeaverId}) - ${i + 1}/${testBeaverIds.length}`);
                
                try {
                    const beaverResult = await provider.callContract({
                        contractAddress: OLD_CONTRACT_ADDRESS,
                        entrypoint: 'get_beaver',
                        calldata: [TEST_USER_ADDRESS, beaverId.toString()]
                    });
                    
                    console.log(`✅ Beaver ${beaverId} data:`, beaverResult);
                    
                    if (beaverResult.result && beaverResult.result.length >= 5) {
                        const rawType = beaverResult.result[1];
                        const rawLevel = beaverResult.result[2];
                        const rawLastClaim = beaverResult.result[3];
                        
                        const type = parseInt(rawType, 16);
                        const level = parseInt(rawLevel, 16);
                        const lastClaim = parseInt(rawLastClaim, 16);
                        
                        console.log(`📊 Parsed data for beaver ${beaverId}:`);
                        console.log(`   Type: ${type} (raw: ${rawType})`);
                        console.log(`   Level: ${level} (raw: ${rawLevel})`);
                        console.log(`   Last Claim: ${lastClaim} (raw: ${rawLastClaim})`);
                        
                        // Type mapping
                        const typeNames = ["Noob", "Pro", "Degen"];
                        console.log(`   Type Name: ${typeNames[type] || "Unknown"}`);
                    }
                } catch (error) {
                    console.log(`❌ Error getting beaver ${beaverId}:`, error.message);
                }
            }
        }
        
        // 4. Kontratın diğer fonksiyonlarını da test et
        console.log("\n4️⃣ Testing other contract functions...");
        
        try {
            const gameInfoResult = await provider.callContract({
                contractAddress: OLD_CONTRACT_ADDRESS,
                entrypoint: 'get_game_info',
                calldata: []
            });
            console.log("📊 Game info:", gameInfoResult);
        } catch (error) {
            console.log("❌ Error getting game info:", error.message);
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

debugOldContract().catch(console.error); 