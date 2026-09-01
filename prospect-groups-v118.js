(()=>{
'use strict';
if(window.__AGP_PROSPECT_GROUPS_V122)return;window.__AGP_PROSPECT_GROUPS_V122=true;
const read=()=>{try{return JSON.parse(localStorage.getItem('inventoryLeadOutreach')||'{}')}catch{return {}}};
const leads=()=>window.INVENTORY_LEADS||[];
let active='Sin contactar';
function syncLeadStates(){const o=read();leads().forEach(l=>{l.outreach=o[l.id]||'Sin contactar'});return o}
function counts(){const o=syncLeadStates();let pending=0,sent=0;leads().forEach(l=>{const s=o[l.id]||'Sin contactar';if(s==='Sin contactar')pending++;else if(s==='Mensaje enviado')sent++});return{pending,sent,total:leads().length}}
function ensure(){const toolbar=document.querySelector('#prospectsModule .toolbar');if(!toolbar)return null;let bar=document.getElementById('agpProspectGroups');if(bar)return bar;bar=document.createElement('div');bar.id='agpProspectGroups';bar.className='agp-prospect-groups';bar.innerHTML=`<div class="agp-prospect-groups-title"><b>Control de prospectos</b><span>Separa pendientes de los ya contactados</span></div><div class="agp-prospect-tabs"><button type="button" data-status="Sin contactar"><span>Por contactar</span><b data-count="pending">0</b></button><button type="button" data-status="Mensaje enviado"><span>Mensajes enviados</span><b data-count="sent">0</b></button><button type="button" data-status="all"><span>Todos</span><b data-count="total">0</b></button></div>`;toolbar.insertAdjacentElement('afterend',bar);bar.addEventListener('click',e=>{const b=e.target.closest('button[data-status]');if(!b)return;e.preventDefault();activate(b.dataset.status,true)});return bar}
function refreshCounts(){const bar=ensure();if(!bar)return;const c=counts();Object.entries(c).forEach(([k,v])=>{const el=bar.querySelector(`[data-count="${k}"]`);if(el)el.textContent=v});bar.querySelectorAll('button[data-status]').forEach(b=>b.classList.toggle('on',b.dataset.status===active))}
function renderNative(){const sel=document.getElementById('out');if(!sel)return;syncLeadStates();if(typeof sel.oninput==='function'){try{sel.oninput({target:sel,currentTarget:sel,type:'input'});return}catch(e){console.warn('Filtro directo',e)}}sel.dispatchEvent(new Event('input',{bubbles:true}))}
function activate(status,scroll=false){const sel=document.getElementById('out');if(!sel)return;active=status;sel.value=status;renderNative();refreshCounts();if(scroll)setTimeout(()=>document.getElementById('grid')?.scrollIntoView({behavior:'smooth',block:'start'}),30)}
function boot(){ensure();syncLeadStates();activate('Sin contactar')}
document.addEventListener('input',e=>{if(e.target?.id==='out'){active=e.target.value;refreshCounts()}});
window.addEventListener('agp:firebase-sync',()=>setTimeout(()=>{syncLeadStates();renderNative();refreshCounts()},40));
window.addEventListener('storage',e=>{if(e.key==='inventoryLeadOutreach')setTimeout(()=>{syncLeadStates();renderNative();refreshCounts()},0)});
document.addEventListener('click',e=>{if(e.target.closest('.stage,.whatsapp'))setTimeout(()=>{syncLeadStates();renderNative();refreshCounts()},180)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();