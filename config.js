module.exports = {
  CYCLE_HOURS: 6,
  TOP_N: 4,
  REAL_TRADING_STARTS_AFTER_CYCLES: 1, // Cycle 1 paper, Cycle 2 onwards real
  FUNDS_PERCENT: 25, // 25%, 50%, 75% - You can change from dashboard
  MAX_LOSS_PER_CYCLE_PCT: 7,
  MAX_DAILY_LOSS_PCT: 12,
  SOLANA: {
    RPC: "https://api.mainnet-beta.solana.com",
    USE_SEED_VAULT: true, // Native Seeker Seed Vault
  },
  MODULES: ['SMC','VWAP','Liquidity','FVG','Breaker','Orderflow','OrderBlock','BOS','CHoCH','EQH-EQL','Premium-Discount','Session']
}
