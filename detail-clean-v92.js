(()=>{
if(window.__AGP_DETAIL_CLEAN_V92)return;window.__AGP_DETAIL_CLEAN_V92=true;
function clean(){document.querySelectorAll('#modal .v7HistoryBtn').forEach(x=>x.remove())}
function boot(){clean();const m=document.getElementById('modal');if(m&&!m.__detailClean92){m.__detailClean92=true;new MutationObserver(ms=>{if(ms.some(x=>x.addedNodes.length))clean()}).observe(m,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();