(()=>{
if(window.__AGP_CARD_SELECT_V90)return;window.__AGP_CARD_SELECT_V90=true;
function leadIdFrom(card){const b=card?.querySelector('[onclick*="openLead"]');const s=b?.getAttribute('onclick')||'';return s.match(/openLead\(['\"]([^'\"]+)['\"]\)/)?.[1]||''}
function open(card){const id=leadIdFrom(card);if(id&&typeof window.openLead==='function')window.openLead(id)}
function boot(){const grid=document.getElementById('grid');if(!grid)return;grid.addEventListener('click',e=>{const card=e.target.closest('.card');if(!card||e.target.closest('a,button,input,select,textarea'))return;open(card)});grid.addEventListener('keydown',e=>{const card=e.target.closest('.card');if(!card||!['Enter',' '].includes(e.key))return;e.preventDefault();open(card)});const prep=()=>grid.querySelectorAll('.card').forEach(c=>{c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label',`Abrir ficha de ${c.querySelector('.name')?.textContent?.trim()||'prospecto'}`)});prep();new MutationObserver(prep).observe(grid,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();