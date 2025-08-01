// Test file for Sepolia contracts
import { Contract, RpcProvider } from "starknet";
import { BURR_TOKEN_ADDRESS, GAME_CONTRACT_ADDRESS, CURRENT_NETWORK } from './utils/constants';

// Test Sepolia contracts
export async function testSepoliaContracts() {
    console.log('🧪 Testing Sepolia contracts...');
    console.log('Current network:', CURRENT_NETWORK);
    console.log('BURR Token address:', BURR_TOKEN_ADDRESS);
    console.log('Game contract address:', GAME_CONTRACT_ADDRESS);

    const provider = new RpcProvider({
        nodeUrl: "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA"
    });

    // Test BURR Token
    try {
        const burrContract = new Contract([
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
            }
        ], BURR_TOKEN_ADDRESS, provider);

        const name = await burrContract.name();
        const symbol = await burrContract.symbol();
        
        console.log('✅ BURR Token test successful:');
        console.log('  Name:', name);
        console.log('  Symbol:', symbol);
    } catch (error) {
        console.error('❌ BURR Token test failed:', error);
    }

    // Test Game Contract
    try {
        const gameContract = new Contract([
            {
                "name": "get_game_info",
                "type": "function",
                "inputs": [],
                "outputs": [{"name": "game_info", "type": "felt*"}],
                "stateMutability": "view"
            }
        ], GAME_CONTRACT_ADDRESS, provider);

        const gameInfo = await gameContract.get_game_info();
        
        console.log('✅ Game contract test successful:');
        console.log('  Game info:', gameInfo);
    } catch (error) {
        console.error('❌ Game contract test failed:', error);
    }
}

// Export for use in browser console
window.testSepoliaContracts = testSepoliaContracts; 