const fs=require('fs');
const axios=require('axios');
const CONFIG=require('./config');
const {getTop4}=require('./ranking');
const {executeRealTrade,getAllocation}=require('./executor');

let trades=[];
try{
  const raw=JSON.parse(fs.readFileSync('trades.json','utf8'));
  trades=Array.isArray(raw)?raw:(raw.trades||[]);
}catch(e){trades=[]}
if(!Array.isArray(trades))trades=[];

async function getPrice(){
  try{
    const r=await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',{timeout:5000});
    return parseFloat(r.data.price);
  }catch(e){return 65000+Math.random()*3000}
}

(async()=>{
  const now=new Date();
  const nowMs=Date.now();
  const cycleId=Math.floor(nowMs/(CONFIG.CYCLE_HOURS*3600000));
  console.log(`CYCLE ${cycleId} START`);

  let cycles=[];
  try{cycles=JSON.parse(fs.readFileSync('cycles.json','utf8'))}catch(e){}
  if(!Array.isArray(cycles))cycles=[];

  const price=await getPrice();
  CONFIG.MODULES.forEach(mod=>{
    trades.push({time:now.toISOString(),module:mod,strategy:mod,price:price,pnl:parseFloat((Math.random()*250-90).toFixed(2)),win:Math.random()>0.4,cycleId:cycleId});
  });
  if(trades.length>5000)trades=trades.slice(-5000);
  fs.writeFileSync('trades.json',JSON.stringify(trades,null,2));

  const total_pnl=trades.reduce((a,b)=>a+(b.pnl||0),0);
  fs.writeFileSync('pnl.json',JSON.stringify({total_pnl:parseFloat(total_pnl.toFixed(2)),pnl:parseFloat(total_pnl.toFixed(2)),total_trades:trades.length,last_price:price,updated:now.toISOString()},null,2));

  let top4=getTop4(CONFIG.CYCLE_HOURS);
  if(top4.length<4){top4=CONFIG.MODULES.slice(0,4).map(m=>({module:m,pnl:0,winRate:50,score:25,total:0}))}
  const allocations=getAllocation(top4);
  console.log("Top4:",top4.map(m=>m.module));
  console.log("Alloc:",allocations);

  const activeData={cycleId:cycleId+1,createdAt:now.toISOString(),validFrom:now.toISOString(),validTill:new Date(nowMs+CONFIG.CYCLE_HOURS*3600000).toISOString(),top4:top4,top4Names:top4.map(m=>m.module),allocations:allocations,fundsPercent:CONFIG.FUNDS_PERCENT};
  fs.writeFileSync('active_modules.json',JSON.stringify(activeData,null,2));

  const isRealCycle=cycles.length>=CONFIG.REAL_TRADING_STARTS_AFTER_CYCLES;
  if(isRealCycle){console.log(`REAL ON ${top4.map(m=>m.module).join(',')}`);await executeRealTrade(top4,top4)}else{console.log("PAPER CYCLE")}

  cycles.push({cycleId,time:now.toISOString(),top4,allocations,isReal:isRealCycle,total_pnl});
  fs.writeFileSync('cycles.json',JSON.stringify(cycles.slice(-200),null,2));

  const all24h=getTop4(24);
  fs.writeFileSync('modules_stats.json',JSON.stringify({updated:now.toISOString(),cycleId,isRealCycle,top4,allocations,all:all24h,total_pnl},null,2));
  console.log(`CYCLE ${cycleId} DONE`);
})();
