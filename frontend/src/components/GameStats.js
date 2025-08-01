import React, { useState, useEffect } from 'react';
import { fetchAllGameData, testContractFunctions } from '../utils/starknet';
import './GameStats.css';

const GameStats = () => {
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Test contract functions first
                await testContractFunctions();
                
                const data = await fetchAllGameData();
                setGameData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching game stats:', err);
                setError('Failed to load game statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatBalance = (balance, decimals = 18) => {
        if (!balance) return '0';
        const divisor = BigInt(10) ** BigInt(decimals);
        const whole = balance / divisor;
        const fraction = balance % divisor;
        const fractionStr = fraction.toString().padStart(decimals, '0');
        return `${whole}.${fractionStr.slice(0, 6)}`;
    };

    if (loading) {
        return (
            <div className="game-stats">
                <div className="stats-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading game statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="game-stats">
                <div className="stats-error">
                    <p>❌ {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    if (!gameData) {
        return null;
    }

    const { analytics, typeStats, totalClaimedBurr, activeUsersCount, contractBalances, gameInfo } = gameData;

    return (
        <div className="game-stats">
            <h2>🎮 Game Statistics</h2>
            
            <div className="stats-grid">
                {/* Beaver Statistics */}
                <div className="stats-section">
                    <h3>🦫 Beaver Statistics</h3>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{formatNumber(analytics.totalBeaversStaked)}</div>
                            <div className="stat-label">Total Beavers Staked</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatNumber(activeUsersCount)}</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatNumber(analytics.totalUpgrades)}</div>
                            <div className="stat-label">Total Upgrades</div>
                        </div>
                    </div>
                </div>

                {/* Beaver Type Distribution */}
                <div className="stats-section">
                    <h3>📊 Beaver Types</h3>
                    <div className="stats-cards">
                        <div className="stat-card noob">
                            <div className="stat-value">{formatNumber(typeStats.noobCount)}</div>
                            <div className="stat-label">Noob Beavers</div>
                        </div>
                        <div className="stat-card pro">
                            <div className="stat-value">{formatNumber(typeStats.proCount)}</div>
                            <div className="stat-label">Pro Beavers</div>
                        </div>
                        <div className="stat-card degen">
                            <div className="stat-value">{formatNumber(typeStats.degenCount)}</div>
                            <div className="stat-label">Degen Beavers</div>
                        </div>
                    </div>
                </div>

                {/* Token Statistics */}
                <div className="stats-section">
                    <h3>💰 Token Statistics</h3>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(analytics.totalBurrClaimed)}</div>
                            <div className="stat-label">Total BURR Claimed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(analytics.totalStrkCollected)}</div>
                            <div className="stat-label">Total STRK Collected</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(analytics.totalBurrBurned)}</div>
                            <div className="stat-label">Total BURR Burned</div>
                        </div>
                    </div>
                </div>

                {/* Contract Balances */}
                <div className="stats-section">
                    <h3>🏦 Contract Balances</h3>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(contractBalances.strkBalance)}</div>
                            <div className="stat-label">STRK Balance</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(contractBalances.burrBalance)}</div>
                            <div className="stat-label">BURR Balance</div>
                        </div>
                    </div>
                </div>

                {/* Game Status */}
                <div className="stats-section">
                    <h3>🎯 Game Status</h3>
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">{gameInfo.isEnded ? 'Ended' : 'Active'}</div>
                            <div className="stat-label">Game Status</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(gameInfo.totalMinted)}</div>
                            <div className="stat-label">Total Minted</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatBalance(gameInfo.maxRewardPool)}</div>
                            <div className="stat-label">Max Reward Pool</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-footer">
                <p>🔄 Data refreshes every 30 seconds</p>
                <p>📅 Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    );
};

export default GameStats; 