(()=>{if(window.__AGP_STATE_COMPAT_V103)return;window.__AGP_STATE_COMPAT_V103=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const variants=read('inventoryLeadVariants');let changed=false;const validVariants=new Set(['A','B','C']);Object.keys(variants).forEach(id=>{if(!validVariants.has(variants[id])){variants[id]='A';changed=true}});if(changed)write('inventoryLeadVariants',variants);
const replies=read('inventoryLeadReplies');const validReply=new Set(['info','price','interested','internal','person','no']);let repliesChanged=false;Object.entries(replies).forEach(([id,r])=>{if(r&&r.type&&!validReply.has(r.type)){replies[id]={...r,type:'info'};repliesChanged=true}});if(repliesChanged)write('inventoryLeadReplies',replies);
const byId=id=>document.getElementById(id);
const hiddenSelect=(id,value='all')=>{let el=byId(id);if(el)return el;el=document.createElement('select');el.id=id;el.hidden=true;const o=document.createElement('option');o.value=value;o.selected=true;el.appendChild(o);document.body.appendChild(el);return el};
window.followStageFilter=byId('followStageFilter')||hiddenSelect('followStageFilter','all');
window.quoteType=byId('quoteType')||hiddenSelect('quoteType','1');
window.quoteDiff=byId('quoteDifferences');window.quoteMulti=byId('quoteMultiArea');window.quoteTravel=byId('quoteMobility');window.quoteResult=byId('quoteResult')||document.querySelector('.quoteResult');window.quoteHealth=byId('quoteHealth');
if(!window.quoteHealth&&window.quoteResult){const h=document.createElement('div');h.id='quoteHealth';h.hidden=true;window.quoteResult.appendChild(h);window.quoteHealth=h}
['q','sector','zone','out','sort','stats','count','grid','acceptedCount','quoteLead','quotePeople','quoteHours','quoteVolume','quoteOrder','quoteSerial','quoteNight','quoteBase','quoteMargin','quoteDiscount','copyQuote','saveQuoteToLead','followFilter','followSort','acceptedGrid','followStats','detail','modal','updates','updatesBtn'].forEach(id=>{const el=byId(id);if(el)window[id]=el});
})();