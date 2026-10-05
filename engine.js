const fs = require('fs');
const CONFIG = require('./config');
const { getTop4 } = require('./ranking');
const { executeRealTrade } = require('./executor');
const axios = require('axios');

async function runCycle(){
  const now = new Date();
  const cycleId = Math.floor(Date.now() / (CONFIG.CYCLE_HOURS*3600000));
  console.log(`\n--- CYCLE ${cycleId} START ${now.toISOString()} ---`);

  // 1. Load or create cycle data
  let cycles = [];
  try{ cycles = JSON.parse(fs.readFileSync('cycles.json','utf8')); }catch(e){}

  // 2. Rank last 6H
  const top4 = getTop4(CONFIG.CYCLE_HOURS);
  console.log("Top 4 for NEXT cycle:", top4.map(m=>`${m.module} Score:${m.score}`));

  // 3. Save active modules for next 6H
  const activeData = {
    cycleId: cycleId + 1,
    validFrom: now.toISOString(),
    validTill: new Date(Date.now() + CONFIG.CYCLE_HOURS*3600000).toISOString(),
    top4: top4,
    top4Names: top4.map(m=>m.module)
  };
  fs.writeFileSync('active_modules.json', JSON.stringify(activeData, null, 2));

  // 4. Decide REAL or PAPER
  const isRealCycle = cycles.length >= CONFIG.REAL_TRADING_STARTS_AFTER_CYCLES;
  let active = [];
  try{ active = JSON.parse(fs.readFileSync('active_modules.json','utf8')).top4Names; }catch(e){ active = top4.map(m=>m.module); }

  console.log(isRealCycle? `💰 REAL TRADING ON: ${active.join(', ')}` : "📝 PAPER CYCLE (No real funds)");

  // 5. Simulate / Run your modules here (you keep your existing module logic)
  // Example signal generation
  if(isRealCycle){
    for(const mod of active){
      await executeRealTrade({ module: mod, side: Math.random()>0.5?'LONG':'SHORT', symbol:'SOL/USDC' });
    }
  }

  // 6. Also continue paper logging for ALL modules (for next ranking)
  //... your existing bot.js trade generation logic here...

  cycles.push({ cycleId, time: now.toISOString(), top4, isReal: isRealCycle });
  fs.writeFileSync('cycles.json', JSON.stringify(cycles.slice(-100), null, 2));

  // 7. Update full stats for dashboard
  const allRanked = getTop4(24); // 24H view
  fs.writeFileSync('modules_stats.json', JSON.stringify({ updated: now.toISOString(), top4, all: allRanked }, null, 2));
}

runCycle();
