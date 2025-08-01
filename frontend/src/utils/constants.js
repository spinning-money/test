import React from 'react';

// Network configuration - Mainnet and Sepolia
export const NETWORKS = {
  MAINNET: 'mainnet',
  SEPOLIA: 'sepolia'
};

// Current network - Mainnet
export const CURRENT_NETWORK = NETWORKS.MAINNET;

// Contract addresses - Mainnet
export const MAINNET_ADDRESSES = {
  BURR_TOKEN: "0x01bc7c8ce3b8fe74e4870adc2965df850d429048e83fad93f3140f52ecb74add",
  GAME_CONTRACT: "0x0138cb7150f311b40163cf4cb4e1be38b795c232ef27c50cdf30b166bec36c27", // Mainnet V3 contract
   STRK_TOKEN: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
};

// Contract addresses - Sepolia Testnet
export const SEPOLIA_ADDRESSES = {
  BURR_TOKEN: "0x029ff99fe8a10df1247b06f113ef9b5b0f76cc593e4f6c1f942876c8a278b0b9",
  GAME_CONTRACT: "0x07896f5e8b88eecafdfca3c7ff499d9d82fdfdc1f4ce5f42247f6c0be0bb9210",
  STRK_TOKEN: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
};

// Export current network addresses based on CURRENT_NETWORK
export const BURR_TOKEN_ADDRESS = CURRENT_NETWORK === NETWORKS.SEPOLIA ? SEPOLIA_ADDRESSES.BURR_TOKEN : MAINNET_ADDRESSES.BURR_TOKEN;
export const GAME_CONTRACT_ADDRESS = CURRENT_NETWORK === NETWORKS.SEPOLIA ? SEPOLIA_ADDRESSES.GAME_CONTRACT : MAINNET_ADDRESSES.GAME_CONTRACT;
export const STRK_ADDRESSES = CURRENT_NETWORK === NETWORKS.SEPOLIA ? [SEPOLIA_ADDRESSES.STRK_TOKEN] : [MAINNET_ADDRESSES.STRK_TOKEN];

// For legacy support
export const CONTRACT_ADDRESSES = {
    BURR_TOKEN: BURR_TOKEN_ADDRESS,
    BURROW_GAME: GAME_CONTRACT_ADDRESS,
    STRK_TOKEN: STRK_ADDRESSES[0]
};

// Game configuration constants - Updated with new economical values
export const GAME_CONFIG = {
  BEAVER_TYPES: {
    NOOB: {
      name: 'Noob',
      stakeCost: 50, // 50 STRK
      hourlyRate: 300, // 300 BURR/hour (updated from 1000)
      maxLevel: 5
    },
    PRO: {
      name: 'Pro', 
      stakeCost: 120, // 120 STRK
      hourlyRate: 750, // 750 BURR/hour (updated from 2250)
      maxLevel: 5
    },
    DEGEN: {
      name: 'Degen',
      stakeCost: 350, // 350 STRK  
      hourlyRate: 2250, // 2250 BURR/hour (updated from 5000)
      maxLevel: 5
    }
  },
  TOTAL_REWARDS: 2100000000, // 2.1B BURR total max supply
  MAX_SUPPLY: 2100000000, // 2.1B BURR max supply
  GAME_DURATION_DAYS: 365,
  // Rate limiting parameters
  MAX_BEAVERS_PER_USER: 10,
  STAKE_COOLDOWN_MINUTES: 5
};

// Updated upgrade costs based on new economics - MATCHING CONTRACT LOGIC
export const UPGRADE_COSTS = {
  // Level 1->2: Same cost for all types
  1: {
    noob: 40000,    // 40k BURR
    pro: 80000,     // 80k BURR  
    degen: 203000,  // 203k BURR
    canUpgrade: true
  },
  // Level 2->3: Same cost for all types
  2: {
    noob: 40000,    // 40k BURR
    pro: 80000,     // 80k BURR
    degen: 203000,  // 203k BURR
    canUpgrade: true
  },
  // Level 3->4: Double cost for all types
  3: {
    noob: 80000,    // 80k BURR (40k * 2)
    pro: 160000,    // 160k BURR (80k * 2)
    degen: 406000,  // 406k BURR (203k * 2)
    canUpgrade: true
  },
  // Level 4->5: Double cost for all types
  4: {
    noob: 80000,    // 80k BURR (40k * 2)
    pro: 160000,    // 160k BURR (80k * 2)
    degen: 406000,  // 406k BURR (203k * 2)
    canUpgrade: true
  }
};

// Beaver images configuration - using string identifiers for components to render
export const BEAVER_IMAGES = {
  NOOB: "noob",
  PRO: "pro", 
  DEGEN: "degen"
};

// Enhanced Beaver component for rendering different types with animations
export const BeaverImage = ({ type, size = "w-16 h-16", isActive = false, showMining = false }) => {
  const getAnimationClass = () => {
    if (showMining && isActive) return "mining-active";
    if (isActive) return "beaver-digging";
    return "";
  };

  const getBeaverDisplay = () => {
    const animationClass = getAnimationClass();
    const activeClass = isActive ? "beaver-active" : "";
    
    switch(type?.toUpperCase()) {
      case 'PRO':
        return (
          <div className={`relative mx-auto ${size} image-container ${activeClass}`}>
            <img 
              src="/beaver_logo.png" 
              alt="Pro Beaver" 
              className={`${size} ${animationClass}`} 
            />
            <span className="absolute -top-1 -right-1 text-yellow-400 text-lg coin-sparkle">⭐</span>
            {showMining && isActive && (
              <div className="absolute -bottom-1 -right-1 animate-pulse">
                ⛏️
              </div>
            )}
          </div>
        );
      case 'DEGEN':
        return (
          <div className={`relative mx-auto ${size} image-container ${activeClass}`}>
            <img 
              src="/beaver_logo.png" 
              alt="Degen Beaver" 
              className={`${size} ${animationClass}`} 
            />
            <span className="absolute -top-1 -right-1 text-blue-400 text-lg coin-sparkle">💎</span>
            {showMining && isActive && (
              <div className="absolute -bottom-1 -right-1 animate-pulse">
                ⛏️
              </div>
            )}
          </div>
        );
      case 'NOOB':
      default:
        return (
          <div className={`relative mx-auto ${size} image-container ${activeClass}`}>
            <img 
              src="/beaver_logo.png" 
              alt="Noob Beaver" 
              className={`${size} ${animationClass}`} 
            />
            {showMining && isActive && (
              <div className="absolute -bottom-1 -right-1 animate-pulse">
                ⛏️
              </div>
            )}
          </div>
        );
    }
  };

  return getBeaverDisplay();
};

export const BEAVER_DESCRIPTIONS = {
  NOOB: "Basic beaver for beginners - 300 BURR/hour",
  PRO: "Experienced beaver with better rewards - 750 BURR/hour", 
  DEGEN: "Elite beaver for maximum earnings - 2,250 BURR/hour"
};

// Social links
export const SOCIAL_LINKS = {
  twitter: "https://x.com/burr_burrow",
  dexscreener: ""
};

// Utility functions
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (num) => {
  const number = Number(num);
  if (number === 0) return '0';
  
  // For very large numbers, use compact notation
  if (number >= 1e18) {
    return (number / 1e18).toFixed(2) + ' BURR';
  } else if (number >= 1e15) {
    return (number / 1e15).toFixed(2) + 'Q';
  } else if (number >= 1e12) {
    return (number / 1e12).toFixed(2) + 'T';
  } else if (number >= 1e9) {
    return (number / 1e9).toFixed(2) + 'B';
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(2) + 'M';
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(2) + 'K';
  } else if (number >= 1) {
    return number.toFixed(2);
  } else {
    return number.toFixed(4);
  }
};

export const calculateTimeLeft = (startTime, duration) => {
  const now = Date.now() / 1000;
  const elapsed = now - startTime;
  const remaining = Math.max(0, duration - elapsed);
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  
  return { days, hours };
};
