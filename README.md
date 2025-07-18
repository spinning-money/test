# BurrowGame - Meme Mining Game on Starknet

A Cairo 2 smart contract system for a meme mining game featuring BURR tokens and beaver NFT staking with STRK payments on Starknet.

## 🔐 Security Notice

**This repository is SECURE** - All private keys, account files, and sensitive information have been removed. See [SECURITY.md](SECURITY.md) for complete security audit details.

## 🎮 Game Overview

BurrowGame is a time-based staking game where players:
- Pay STRK tokens to stake virtual "Beaver" NFTs (internal mapping system)
- Earn BURR tokens over time based on beaver type and level
- Upgrade beavers using earned BURR tokens
- Compete for rewards from a 700 million BURR token pool
- Game duration: 365 days from deployment

## 💰 STRK Payment System

### Staking Costs
Players must pay STRK tokens to stake beavers:

| Beaver Type | STRK Cost | BURR Rewards (Level 1) | Max Rewards (Level 5) |
|-------------|-----------|------------------------|----------------------|
| Noob        | 12 STRK   | 100 BURR/hour         | ~70,000 BURR        |
| Pro         | 30 STRK   | 250 BURR/hour         | ~175,000 BURR       |
| Degen       | 60 STRK   | 500 BURR/hour         | ~350,000 BURR       |

### Upgrade System
- **Payment**: BURR tokens (earned through staking)
- **Burn Mechanism**: Upgrade costs are burned from user's BURR balance
- **Level 5 Upgrade Example**: 
  - Noob Level 5: 12 STRK + 75,000 BURR burned → 350,000 BURR potential

## 📋 Contract Structure

### 1. BURR Token (`BURRToken.cairo`)
A custom ERC20 token with the following features:
- **Name**: Burrow
- **Symbol**: BURR  
- **Decimals**: 18
- **Total Supply Cap**: 1 billion BURR tokens
- **Minting Authorization**: Only authorized addresses can mint
- **Burn Functionality**: `burnFrom()` for in-game token burning
- **Owner Management**: Deploy-time owner with authorization controls

### 2. BurrowGame Contract (`BurrowGame.cairo`)
The main game logic contract featuring:
- **STRK Payment Integration**: Required for beaver staking
- **Beaver Staking**: Three types (Noob, Pro, Degen) with different costs and rewards
- **Level System**: Beavers can be upgraded from level 1 to 5 (1.5x multiplier per level)
- **Time-based Rewards**: Hourly reward accumulation based on beaver stats
- **Claim System**: Players can claim accumulated BURR tokens
- **Upgrade System**: Burn BURR tokens to upgrade beavers
- **365-day Duration**: Automatic game end after 1 year
- **Reward Pool**: Maximum 700 million BURR tokens can be minted

## 🦫 Beaver Types & Economics

| Type | STRK Cost | Base Reward (per hour) | Max Level 5 Reward | Total Potential |
|------|-----------|----------------------|-------------------|-----------------|
| Noob (0) | 12 STRK | 100 BURR | 506.25 BURR/hour | ~70,000 BURR |
| Pro (1) | 30 STRK | 250 BURR | 1,265.625 BURR/hour | ~175,000 BURR |
| Degen (2) | 60 STRK | 500 BURR | 2,531.25 BURR/hour | ~350,000 BURR |

### Level Multipliers
- Level 1: 1.0x (base)
- Level 2: 1.5x
- Level 3: 2.25x
- Level 4: 3.375x
- Level 5: 5.0625x

### Upgrade Costs (BURR Tokens Burned)
- Level 1→2: 1,000 BURR
- Level 2→3: 2,500 BURR  
- Level 3→4: 6,250 BURR
- Level 4→5: 15,625 BURR
- **Total to Max Level**: 25,375 BURR tokens burned

## 🛠 Development Setup

### Prerequisites
- [Scarb](https://docs.swmansion.com/scarb/) (Cairo package manager)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) (for testing)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd burrowgame

# Install dependencies
scarb build
```

### Project Structure
```
burrowgame/
├── Scarb.toml          # Project configuration
├── src/
│   ├── lib.cairo       # Main library file
│   ├── BURRToken.cairo # BURR ERC20 token contract
│   └── BurrowGame.cairo # Main game contract
├── tests/
│   ├── test_contract.cairo       # Original hello contract tests
│   └── test_burrow_contracts.cairo # Game contract tests
└── README.md
```

## 🧪 Testing

Run the test suite:
```bash
scarb test
```

The tests cover:
- BURR token deployment and basic functionality
- BurrowGame deployment and initialization  
- Beaver staking mechanics
- Game state management

## 📜 Contract Interfaces

### BURR Token Interface
```cairo
fn name() -> ByteArray;
fn symbol() -> ByteArray;
fn decimals() -> u8;
fn total_supply() -> u256;
fn balance_of(account: ContractAddress) -> u256;
fn transfer(recipient: ContractAddress, amount: u256) -> bool;
fn mint(to: ContractAddress, amount: u256);        // Authorized only
fn burn_from(from: ContractAddress, amount: u256); // Game integration
fn authorize_minter(minter: ContractAddress);      // Owner only
```

### BurrowGame Interface
```cairo
fn stake_beaver(beaver_type: u8);                           // 0=Noob, 1=Pro, 2=Degen
fn claim();                                                 // Claim accumulated rewards
fn upgrade_beaver(beaver_id: u64);                         // Spend BURR to upgrade
fn get_user_beavers(owner: ContractAddress) -> Array<u64>; // Get user's beaver IDs
fn calculate_pending_rewards(owner: ContractAddress) -> u256; // Preview rewards
fn get_game_info() -> GameInfo;                            // Game status
fn is_game_ended() -> bool;                                // Check if game ended
```

## 🎯 Usage Examples

### Deploy Contracts
1. Deploy BURR token with owner address
2. Deploy BurrowGame with owner address  
3. Authorize BurrowGame contract to mint BURR tokens
4. Set BURR token address in BurrowGame contract

### Player Actions
```cairo
// Stake a Degen beaver (type 2)
game_contract.stake_beaver(2);

// Check pending rewards
let rewards = game_contract.calculate_pending_rewards(player_address);

// Claim accumulated BURR tokens
game_contract.claim();

// Upgrade beaver with ID 1
game_contract.upgrade_beaver(1);
```

## ⚠️ Important Notes

- Game duration is exactly 365 days from deployment
- Maximum reward pool is 700 million BURR tokens
- Only authorized addresses can mint BURR tokens
- Beaver upgrades burn BURR tokens permanently
- Game owner can call `burnRemaining()` after 365 days to finalize

## 🔒 Security Features

- **Authorization System**: Only approved addresses can mint tokens
- **Supply Cap**: Hard limit of 1 billion BURR tokens  
- **Time Locks**: Game automatically ends after 365 days
- **Ownership Controls**: Protected admin functions
- **Zero Address Checks**: Prevents invalid transfers

## 📊 Gas Optimization

The contracts use efficient Cairo patterns:
- Internal mappings for beaver data (no actual NFT transfers)
- Batch operations where possible
- Minimal external calls
- Optimized storage layout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality  
5. Run `scarb test` to ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

Built with:
- [Cairo](https://github.com/starkware-libs/cairo) - Smart contract language
- [Starknet](https://starknet.io/) - Layer 2 scaling solution
- [Scarb](https://docs.swmansion.com/scarb/) - Cairo package manager
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) - Testing framework 