const fs = require('fs');
const axios = require('axios');

// --- LOAD EXISTING ---
let trades = [];
let pnlData = { total_pnl: 0, total_trades: 0 };
try { trades = JSON.parse(fs.readFileSync('trades.json','utf8')); } catch(e){}
try { pnlData = JSON.parse(fs.readFileSync('pnl.json','utf8')); } catch(e){}

// --- YOUR MODULES (Top 12 Mahadev Modules) ---
const MODULES = [
  'SMC','VWAP','Liquidity','FVG','Breaker',
  'Orderflow','OrderBlock','BOS','CHoCH',
