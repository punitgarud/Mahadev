const fs = require('fs');
const CONFIG = require('./config');

function getTop4(lastHours = 6){
  let trades = [];
  try{ trades = JSON.parse(fs.readFileSync('trades.json','utf8')); }catch(e){ return []; }
  if(!Array.isArray(trades)) trades = [];

  const cutoff = Date.now() - lastHours*60*60*1000;
  const recent = trades.filter(t => new Date(t.time).getTime() > cutoff);

  const stats = {};
  recent.forEach(t => {
    const m = t.module;
    if(!stats[m]) stats[m] = { module:m, pnl:0, wins:0, loss:0, total:0, grossProfit:0, grossLoss:0, maxDD:0 };
    stats[m].pnl += t.pnl||0;
    stats[m].total++;
    if(t.pnl>0){ stats[m].wins++; stats[m].grossProfit+=t.pnl; } else { stats[m].grossLoss+=Math.abs(t.pnl); }
  });

  const ranked = Object.values(stats).map(s=>{
    const winRate = s.total? (s.wins/s.total*100):0;
    const profitFactor = s.grossLoss? (s.grossProfit/s.grossLoss): s.grossProfit;
    const score = (s.pnl * (winRate/100) * (profitFactor||1));
    return {...s, winRate: Math.round(winRate), profitFactor: profitFactor.toFixed(2), score: parseFloat(score.toFixed(2)) };
  }).sort((a,b)=> b.score - a.score);

  return ranked.slice(0, CONFIG.TOP_N);
}

module.exports = { getTop4 };
