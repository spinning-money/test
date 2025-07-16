# BurrowGame Contract Deployment

## Deployment Information

**Date**: July 14, 2025  
**Network**: Starknet Sepolia  
**Compiler**: Cairo v2.11.4  

## Contract Details

### BurrowGame Contract
- **Contract Address**: `0x04f995d708fd58fe561f73806e866a2520373728af2f0ea0553c5ab5753e897d`
- **Class Hash**: `0x060062451b45d28e3edca2dcf2611ec66de07c996473b7e9b8f40f4eecfe1818`
- **Transaction Hash**: `0x0345d8f1df1bb9df5e3e21e7f61f53a9f6c8ef9feb42681a5daedceee7c2e3c5`
- **Owner**: `0x01BE47EbD8FCbCd4c1fB472DFd452530D86ce18b0381233836a7994154D88617`

### BURR Token Contract
- **Contract Address**: `0x0070ec81bb3e60c8dbc936880e234a0b6d529656aa18ebdfa8f497642bdb4e74`

## Explorer Links

- **BurrowGame Contract**: [View on StarkScan](https://sepolia.starkscan.co/contract/0x04f995d708fd58fe561f73806e866a2520373728af2f0ea0553c5ab5753e897d)
- **Deployment Transaction**: [View on StarkScan](https://sepolia.starkscan.co/tx/0x0345d8f1df1bb9df5e3e21e7f61f53a9f6c8ef9feb42681a5daedceee7c2e3c5)

## Deployment Wallet

- **Address**: `0x01BE47EbD8FCbCd4c1fB472DFd452530D86ce18b0381233836a7994154D88617`
- **Private Key**: Stored securely in environment variables
- **RPC URL**: `https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/EXk1VtDVCaeNBRAWsi7WA`

## Game Configuration

### Staking Costs (STRK)
- **Noob Beaver**: 12 STRK
- **Pro Beaver**: 30 STRK  
- **Degen Beaver**: 60 STRK

### Hourly Rates (BURR)
- **Noob Beaver**: 100 BURR/hour
- **Pro Beaver**: 250 BURR/hour
- **Degen Beaver**: 500 BURR/hour

### Upgrade Costs (BURR)
- **Level 2**: 100 BURR
- **Level 3**: 250 BURR
- **Level 4**: 500 BURR
- **Level 5**: Variable based on beaver type

### Game Settings
- **Max Reward Pool**: 700,000,000 BURR
- **Level Multiplier**: 1.5x per level
- **Game Duration**: 365 days

## Deployment Process

1. **Environment Setup**: Used secure environment variables for private key management
2. **Account Import**: Imported deployment account using `sncast account import`
3. **Contract Declaration**: Declared contract with class hash `0x060062451b45d28e3edca2dcf2611ec66de07c996473b7e9b8f40f4eecfe1818`
4. **Contract Deployment**: Deployed with owner parameter
5. **Frontend Update**: Updated `constants.js` with new contract address

## Security Features

- Private keys stored in environment variables only
- No sensitive information in repository files
- Account files removed after deployment
- Owner-only functions protected
- Transfer-based reward system (no minting authorization issues)

## Next Steps

1. **Fund Contract**: Use `fund_burr_pool()` function to add BURR tokens for rewards
2. **Set Token Addresses**: Configure BURR and STRK token addresses if needed
3. **Test Functionality**: Verify staking, claiming, and upgrade functions
4. **Frontend Integration**: Test frontend with new contract address

## Commands Used

```bash
# Export environment variables
export STARKNET_PRIVATE_KEY=<private_key>
export STARKNET_ACCOUNT_ADDRESS=<account_address>

# Import account
sncast account import --name deployment --address $STARKNET_ACCOUNT_ADDRESS --private-key $STARKNET_PRIVATE_KEY --type oz

# Declare contract
sncast --account deployment declare --contract-name BurrowGame

# Deploy contract
sncast --account deployment deploy --class-hash 0x060062451b45d28e3edca2dcf2611ec66de07c996473b7e9b8f40f4eecfe1818 --constructor-calldata $STARKNET_ACCOUNT_ADDRESS
``` 