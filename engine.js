const fs = require('fs');
const axios = require('axios');
const CONFIG = require('./config');
const { getTop4 } = require('./ranking');
const { executeRealTrade, getAllocation } = require('./executor');

// --- LOAD TRADES ---
let trades = [];
try {
  const raw = JSON.parse(fs.readFileSync('trades.json','utf8'));
  if(Array.isArray(raw)) trades = raw;
  else if(raw.trades) trades = raw.trades;
  else trades = [];
} catch(e){ trades = []; }
if(!Array.isArray(trades)) trades = [];

async function getPrice(){
  try{
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',{timeout:5000});
    return parseFloat(r.data.price);
  }catch(e){ return 65000 + Math.random()*3000; }
}

(async () => {
  const now = new Date();
  const nowMs = Date.now();
  const cycleId = Math.floor(nowMs / (CONFIG.CYCLE_HOURS*3600000));
  console.log(`\n=== MAHADEV CYCLE ${cycleId} START ${now.toISOString()} ===`);

  // --- LOAD CYCLES ---
  let cycles = [];
  try{ cycles = JSON.parse(fs.readFileSync('cycles.json','utf8')); }catch(e){}
  if(!Array.isArray(cycles)) cycles = [];

  // --- STEP 1: Generate PAPER trades for ALL 12 modules (for ranking) ---
  const price = await getPrice();
  CONFIG.MODULES.forEach(mod => {
    const pnl = (Math.random()*250 - 90); // Replace with your real module signal logic
    trades.push({
      time: now.toISOString(),
      module
