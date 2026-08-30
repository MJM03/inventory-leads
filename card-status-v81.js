(()=>{
if(window.__AGP_CARD_STATUS_V97)return;window.__AGP_CARD_STATUS_V97=true;
const KEY='inventoryLeadOutreach';
const labels={
 'Sin contactar':['Nuevo','new'],
 'Mensaje enviado':['Enviado','sent'],
 'Respondió':['Respondió','reply'],
 'Interesado':['Interesado','hot'],
 'Aceptó propuesta':['Aceptó','quote'],
 'Seguimiento':['Seguimiento','follow'],
 'No interesado':['No interesado','cold']
};
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}}
function state(id){const a=read('inventoryLeadAccepted')[id];if(a){const s=a.stage||'';if(s==='Cerrado')return['Cerrado','closed'];if(s==='Cotización enviada'||s==='Por cotizar')return['Cotizando','quote'];if(s==='Negociando')return['Negociando','hot'];if(s==='Fecha confirmada')return['Confirmado','closed'];if(s==='Servicio realizado')return['Realizado','closed'];if(s==='Cobro pendiente')return['Por cobrar','follow']}return labels[read(KEY)[id]||'Sin contactar']||labels['Sin contactar']}
function idFromCard(card){const b=card.querySelector('[onclick*="openLead"]');return b?.getAttribute('onclick')?.match(/openLead\(['"]([^'"]+)/)?.[1]||''}
function paintCard(card){const box=card.querySelector('.score'),id=idFromCard(card);if(!box||!id)return;const [text,cls]=state(id),key=`${cls}|${text}`;if(box.dataset.cardState===key)return;box.dataset.cardState=key;box.className='score cardState81 '+cls;box.innerHTML=`<span class="stateIcon81" aria-hidden="true"></span><b>${text}</b>`;box.title='Estado comercial actual'}
function paint(root=document){root.querySelectorAll?.('#grid .card').forEach(paintCard)}
function boot(){paint();const grid=document.getElementById('grid');if(!grid)return;let queued=false;new MutationObserver(muts=>{if(queued)return;const hasNewCard=muts.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.card')||n.querySelector?.('.card'))));if(!hasNewCard)return;queued=true;requestAnimationFrame(()=>{queued=false;paint(grid)})}).observe(grid,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();