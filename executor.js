const CONFIG = require('./config');

function getAllocation(top4){
  const totalScore = top4.reduce((a,m)=>a+m.score,0) || 1;
  let alloc = top4.map(m=>{
    let w = m.score/totalScore;
    w = Math.max(0.15, Math.min(0.40, w)); // 15% min, 40% max
    return { module: m.module, weight: w, score: m.score };
  });
  // re-normalize to 100% after floor/cap
  const sum = alloc.reduce((a,m)=>a+m.weight,0);
  alloc = alloc.map(m=> ({...m, weight: m.weight/sum, amountPct: Math.round(m.weight/sum*100)}));
  return alloc;
}

async function executeRealTrade(signals, top4){
  const allocations = getAllocation(top4);
  console.log("💰 DYNAMIC ALLOCATION:", allocations);

  for(const a of allocations){
    const fundsForThis = (CONFIG.FUNDS_PERCENT/100) * a.weight; // % of total wallet
    console.log(`-> ${a.module}: ${a.amountPct}% of cycle = ${fundsForThis*100}% of wallet | REAL EXECUTE`);
    // jupiterSwap with amount = walletBalance * fundsForThis
  }
}

module.exports = { executeRealTrade, getAllocation };
