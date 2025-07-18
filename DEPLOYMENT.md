# BurrowGame Mainnet Deployment

## Contract Addresses

### BURR Token
- **Contract Address**: `0x04553dfcd5b26cdc529b684627db845517a2d47f20a9101f59479c4bf9d91e4e`
- **Class Hash**: `0x02faab619c68b9202006898454b213b7b751d16ca58563062792c769bacb8ad7`
- **Standard**: ERC20
- **Explorer**: [View on Voyager](https://voyager.online/contract/0x04553dfcd5b26cdc529b684627db845517a2d47f20a9101f59479c4bf9d91e4e)

### BurrowGame Contract
- **Contract Address**: `0x05c2320a3dea383f35a174ffc098a289edf89067e84701f0c778ed5e37c1cc1e`
- **Class Hash**: `0x058ebe78b894c91753268bc2d6b97312a4ae8d6c2dd399bbb638658a7d528084`
- **Explorer**: [View on Voyager](https://voyager.online/contract/0x05c2320a3dea383f35a174ffc098a289edf89067e84701f0c778ed5e37c1cc1e)

## Deployment Details

### Network
- **Starknet Mainnet**
- **RPC**: https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA

### Deployer Account
- **Address**: `0x049c97B55f2eF9523B50A61E66E8749F0c1F447C3a4e46944A0ED8b2EdD305ac`

### STRK Token (Official)
- **Address**: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d`

## Source Code Verification

Due to current limitations with Starknet explorer verification tools, the contracts are currently unverified on explorers. However, the complete source code is available in this repository.

### Verification Commands Used
```bash
# Build
scarb build

# Declare (BURR Token)
starkli declare target/dev/burrowgame_ERC20Token.contract_class.json

# Declare (BurrowGame)  
starkli declare target/dev/burrowgame_BurrowGame.contract_class.json

# Deploy
starkli deploy [CLASS_HASH] [CONSTRUCTOR_ARGS]
```

### Build Reproducibility
To verify the contracts yourself:

1. Clone this repository
2. Install Cairo and Scarb
3. Run `scarb build`
4. Compare the generated class hashes with those deployed

## Contract Security

### Audited Features
- ✅ Reentrancy protection
- ✅ Access control (only owner functions)
- ✅ Safe arithmetic operations
- ✅ Proper token minting mechanics
- ✅ Staking rewards calculation

### Known Security Fixes Applied
- Fixed claim_rewards to mint new tokens instead of transferring burned tokens
- Added proper reward preservation during level upgrades
- Implemented safe math for all calculations

## Game Economics

### Beaver Types & Rates
- **Noob**: 300 BURR/hour, 50 STRK stake cost
- **Pro**: 750 BURR/hour, 120 STRK stake cost  
- **Degen**: 2,250 BURR/hour, 350 STRK stake cost

### Upgrade Costs
Progressive BURR token costs for leveling up beavers within each type.

## Launch Strategy

**Phase 1 (Current)**: Controlled launch with claiming disabled
**Phase 2 (Future)**: Full launch requiring `authorize_minter` call

## Contact

For any questions about the deployment or verification, please contact the development team. 