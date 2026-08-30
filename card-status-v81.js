(()=>{
if(window.__AGP_CARD_STATUS_V81)return;window.__AGP_CARD_STATUS_V81=true;
const KEY='inventoryLeadOutreach';
const labels={
 'Sin contactar':['🆕','Nuevo','new'],
 'Mensaje enviado':['📤','Enviado','sent'],
 'Respondió':['💬','Respondió','reply'],
 'Interesado':['🔥','Interesado','hot'],
 'Aceptó propuesta':['📄','Aceptó','quote'],
 'Seguimiento':['⏰','Seguimiento','follow'],
 'No interesado':['—','No interesado','cold']
};
function accepted(){try{return JSON.parse(localStorage.getItem('inventoryLeadAccepted')||'{}')}catch{return{}}}
function outreach(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
function state(id){const a=accepted()[id];if(a){const s=a.stage||'';if(s==='Cerrado')return['✅','Cerrado','closed'];if(s==='Cotización enviada'||s==='Por cotizar')return['📄','Cotizando','quote'];if(s==='Negociando')return['🤝','Negociando','hot'];if(s==='Fecha confirmada')return['📅','Confirmado','closed'];if(s==='Servicio realizado')return['✓','Realizado','closed'];if(s==='Cobro pendiente')return['💰','Por cobrar','follow']}return labels[outreach()[id]||'Sin contactar']||labels['Sin contactar']}
function idFromCard(card){const b=card.querySelector('[onclick*="openLead"]');return b?.getAttribute('onclick')?.match(/openLead\(['"]([^'"]+)/)?.[1]||''}
function paint(root=document){root.querySelectorAll?.('#grid .card').forEach(card=>{const box=card.querySelector('.score'),id=idFromCard(card);if(!box||!id)return;const [icon,text,cls]=state(id);box.className='score cardState81 '+cls;box.innerHTML=`<span>${icon}</span><b>${text}</b>`;box.title='Estado comercial actual'})}
function boot(){paint();const grid=document.getElementById('grid');if(!grid)return;new MutationObserver(()=>paint(grid)).observe(grid,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();