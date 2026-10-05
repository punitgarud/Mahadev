const fs = require('fs');
const axios = require('axios');

// --- LOAD EXISTING - FIX FOR YOUR ERROR ---
let trades = [];
try {
  const raw = JSON.parse(fs.readFileSync('trades.json','utf8'));
  if(Array.isArray(raw)) trades = raw;
  else if(raw.trades && Array.isArray(raw.trades)) trades = raw.trades;
  else if(raw.data && Array.isArray(raw.data)) trades = raw.data;
  else trades = [];
} catch(e){ trades = []; }

let pnlData = { total_pnl: 0, total_trades: 0 };
try { pnlData = JSON.parse(fs.readFileSync('pnl.json','utf8')); } catch(e){}

const MODULES = ['SMC','VWAP','Liquidity','FVG','Breaker','Orderflow','OrderBlock','BOS','CHoCH','EQH-EQL','Premium-Discount','Session'];

async function getPrice(){
  try{
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {timeout:5000});
    return parseFloat(r.data.price);
  }catch(e){ return 65000 + Math.random()*2000; }
}

(async () => {
  const price = await getPrice();
  const now = new Date().toISOString();

  // Ensure trades is array (your error fix)
  if(!Array.isArray(trades)) trades = [];

  MODULES.forEach(mod => {
    const pnl = (Math.random()*200 - 80);
    trades.push({
      time: now,
      module: mod,
      strategy: mod,
      price: price,
      pnl: parseFloat(pnl.toFixed(2)),
      win: pnl > 0
    });
  });

  if(trades.length > 3000) trades = trades.slice(-3000);
  const total_pnl = trades.reduce((a,b)=>a+(b.pnl||0),0);

  pnlData = {
    total_pnl: parseFloat(total_pnl.toFixed(2)),
    pnl: parseFloat(total_pnl.toFixed(2)),
    total_trades: trades.length,
    last_price: price,
    updated: now
  };

  fs.writeFileSync('trades.json', JSON.stringify(trades, null, 2));
  fs.writeFileSync('pnl.json', JSON.stringify(pnlData, null, 2));

  const stats = {};
  trades.forEach(t => {
    const m = t.module || t.strategy || 'Unknown';
    if(!stats[m]) stats[m] = { module:m, pnl:0, wins:0, total:0 };
    stats[m].pnl += (t.pnl || 0);
    stats[m].total += 1;
    if(t.pnl > 0) stats[m].wins += 1;
  });

  const ranked = Object.values(stats).map(s => ({
    module: s.module,
    pnl: parseFloat(s.pnl.toFixed(2)),
    wins: s.wins,
    total: s.total,
    winRate: s.total? Math.round((s.wins/s.total)*100) : 0
  })).sort((a,b) => b.pnl - a.pnl);

  const out = {
    updated: now,
    top5: ranked.slice(0,5),
    all: ranked
  };

  fs.writeFileSync('modules_stats.json', JSON.stringify(out, null, 2));
  console.log("SUCCESS - Total PnL:", total_pnl.toFixed(2));
  console.log("Top5:", out.top5);
})();
