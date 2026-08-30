(()=>{
if(window.__AGP_DETAIL_STABLE_V105)return;window.__AGP_DETAIL_STABLE_V105=true;
let settleTimer,maxTimer,settleToken=0;
function cleanHistory(){document.querySelectorAll('#modal .v7HistoryBtn').forEach(x=>x.remove())}
function classes(open){document.documentElement.classList.toggle('detailOpen105',open);document.body.classList.toggle('detailOpen105',open)}
function reveal(token){if(token!==settleToken)return;clearTimeout(settleTimer);clearTimeout(maxTimer);const d=document.getElementById('detail');if(!d)return;d.classList.remove('agpModalPreparing105');d.classList.add('agpModalReady105');classes(!!d.open)}
function arm(token,ms=120){clearTimeout(settleTimer);settleTimer=setTimeout(()=>reveal(token),ms)}
function prepare(){const d=document.getElementById('detail'),m=document.getElementById('modal');if(!d||!m)return 0;settleToken++;const token=settleToken;clearTimeout(settleTimer);clearTimeout(maxTimer);d.classList.remove('agpModalReady105');d.classList.add('agpModalPreparing105');m.scrollTop=0;arm(token,170);maxTimer=setTimeout(()=>reveal(token),520);return token}
function closeDetail(){const d=document.getElementById('detail');if(!d)return;settleToken++;clearTimeout(settleTimer);clearTimeout(maxTimer);try{if(d.open)d.close()}catch{}d.classList.remove('agpModalPreparing105','agpModalReady105');classes(false)}
function wrapOpen(){const old=window.openLead;if(typeof old!=='function'||old.__stable105)return false;const wrapped=function(...args){const token=prepare();const r=old.apply(this,args);requestAnimationFrame(()=>requestAnimationFrame(()=>arm(token,150)));return r};wrapped.__stable105=true;window.openLead=wrapped;return true}
function boot(){const d=document.getElementById('detail'),modal=document.getElementById('modal');if(!d||!modal)return;wrapOpen();cleanHistory();
 if(!modal.__detail105obs){modal.__detail105obs=true;new MutationObserver(ms=>{cleanHistory();if(!d.open)return;const meaningful=ms.some(mu=>mu.type==='childList'||mu.type==='characterData'||(mu.type==='attributes'&&mu.attributeName==='class'));if(meaningful)arm(settleToken,120)}).observe(modal,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']})}
 document.addEventListener('click',e=>{const close=e.target?.closest?.('#modal .close');if(close){e.preventDefault();e.stopPropagation();closeDetail();return}if(e.target===d){e.preventDefault();closeDetail()}},true);
 d.addEventListener('cancel',e=>{e.preventDefault();closeDetail()});
 d.addEventListener('close',()=>{settleToken++;clearTimeout(settleTimer);clearTimeout(maxTimer);d.classList.remove('agpModalPreparing105','agpModalReady105');classes(false)});
 window.addEventListener('pageshow',()=>classes(!!d.open));
 setTimeout(wrapOpen,0);setTimeout(wrapOpen,250)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();