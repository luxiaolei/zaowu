/** Planning calculator: assumptions are NOT current vendor quotes. */
const envNumber=(key,fallback)=>{const n=process.env[key]===undefined?fallback:Number(process.env[key]);if(!Number.isFinite(n)||n<0)throw new Error(`Invalid ${key}`);return n;};
export function costs({sessions=12,minutesPerSession=20,liveMinutes=8,avatarUsdPerMinute=.26,fx=7,
  imageCalls=24,imageRmbPerCall=.25,llmRmb=12,voiceRmb=8,storageModerationRmb=5,
  failureMultiplier=1.15,utilization=.8,price=129,feeRate=.03,refundRate=.05,cac=100,retainedMonths=4}={}){
 if(utilization<=0||utilization>1||liveMinutes>sessions*minutesPerSession)throw new Error('Invalid usage assumptions');
 const avatar=liveMinutes*avatarUsdPerMinute*fx/utilization;
 const images=imageCalls*imageRmbPerCall*failureMultiplier;
 const variable=avatar+images+llmRmb+voiceRmb+storageModerationRmb;
 const net=price*(1-feeRate-refundRate);
 return {assumptionsOnly:true,avatar,images,variable,net,contribution:net-variable,
   contributionMargin:net?((net-variable)/net):null,
   contributionAfterAcquisition:net-variable-(retainedMonths>0?cac/retainedMonths:cac)};
}
if(import.meta.url===`file://${process.argv[1]}`){
 const result=costs({liveMinutes:envNumber('LIVE_MINUTES',8),price:envNumber('PRICE_RMB',129),
   imageCalls:envNumber('IMAGE_CALLS',24),imageRmbPerCall:envNumber('IMAGE_RMB',.25),
   fx:envNumber('USD_CNY_ASSUMPTION',7),utilization:envNumber('PLAN_UTILIZATION',.8)});
 console.log('ASSUMPTIONS ONLY / 规划假设，不是当前报价。Trial 本地模式不调用付费 API。');
 console.log(JSON.stringify(result,null,2));
}
