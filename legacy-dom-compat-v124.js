(()=>{
  'use strict';
  const byId=id=>document.getElementById(id);
  function hiddenSelect(id,value='all'){
    let el=byId(id);if(el)return el;
    el=document.createElement('select');el.id=id;el.hidden=true;
    const o=document.createElement('option');o.value=value;o.textContent=value;o.selected=true;el.appendChild(o);
    document.body.appendChild(el);return el;
  }
  function boot(){
    window.followStageFilter=byId('followStageFilter')||hiddenSelect('followStageFilter','all');
    window.quoteType=byId('quoteType')||hiddenSelect('quoteType','1');
    window.quoteDiff=byId('quoteDifferences');
    window.quoteMulti=byId('quoteMultiArea');
    window.quoteTravel=byId('quoteMobility');
    window.quoteResult=byId('quoteResult')||document.querySelector('.quoteResult');
    window.quoteHealth=byId('quoteHealth');
    if(!window.quoteHealth&&window.quoteResult){const h=document.createElement('div');h.id='quoteHealth';h.hidden=true;window.quoteResult.appendChild(h);window.quoteHealth=h;}
    ['q','sector','zone','out','sort','stats','count','grid','acceptedCount','quoteLead','quotePeople','quoteHours','quoteVolume','quoteOrder','quoteSerial','quoteNight','quoteBase','quoteMargin','quoteDiscount','copyQuote','saveQuoteToLead','followFilter','followSort','acceptedGrid','followStats','detail','modal','updates','updatesBtn'].forEach(id=>{const el=byId(id);if(el)window[id]=el;});
  }
  boot();
})();