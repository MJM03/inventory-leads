(()=>{
if(window.__AGP_DETAIL_STABLE_V102)return;window.__AGP_DETAIL_STABLE_V102=true;
function cleanHistory(){document.querySelectorAll('#modal .v7HistoryBtn').forEach(x=>x.remove())}
function classes(open){document.documentElement.classList.toggle('detailOpen102',open);document.body.classList.toggle('detailOpen102',open)}
function closeDetail(){const d=document.getElementById('detail');if(!d)return;try{if(d.open)d.close()}catch{}classes(false)}
function boot(){const d=document.getElementById('detail');if(!d)return;cleanHistory();
 document.addEventListener('click',e=>{const close=e.target?.closest?.('#modal .close');if(close){e.preventDefault();e.stopPropagation();closeDetail();return}if(e.target===d){e.preventDefault();closeDetail()}},true);
 d.addEventListener('cancel',e=>{e.preventDefault();closeDetail()});
 d.addEventListener('close',()=>classes(false));
 const modal=document.getElementById('modal');if(modal&&!modal.__detail102obs){modal.__detail102obs=true;new MutationObserver(()=>{cleanHistory();if(d.open)classes(true)}).observe(modal,{childList:true})}
 window.addEventListener('pageshow',()=>classes(!!d.open));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();