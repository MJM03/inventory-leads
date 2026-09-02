(()=>{
if(window.__AGP_CONTACT_DISPLAY_V129)return;window.__AGP_CONTACT_DISPLAY_V129=true;
const leads=()=>window.INVENTORY_LEADS||[];
const confirmedIds=new Set(['palieres-stiven','nsi-importador','marzano','oimi','soluciones-dican','grupo-goimsa']);
const digits=v=>(v||'').replace(/\D/g,'');
const fmt=v=>{let n=digits(v).replace(/^51(?=9\d{8}$)/,'');return /^9\d{8}$/.test(n)?`${n.slice(0,3)} ${n.slice(3,6)} ${n.slice(6)}`:(v||'').trim()};
function idFromCard(card){const b=card.querySelector('[onclick*="openLead"]');return b?.getAttribute('onclick')?.match(/openLead\(['"]([^'"]+)/)?.[1]||''}
function isVerified(l){return !!(l.whatsappVerified||confirmedIds.has(l.id)||(/whatsapp/i.test(l.source||'')&&!l.whatsappAssumed));}
function chipText(chip,text){if(!chip)return;const svg=chip.querySelector('svg')?.cloneNode(true);chip.textContent=text;if(svg)chip.prepend(svg);}
function paint(card){
 const id=idFromCard(card),l=leads().find(x=>x.id===id);if(!l)return;
 const contact=card.querySelector('.contact');if(!contact)return;
 const verified=isVerified(l),number=fmt(verified?(l.whatsapp||l.phone):(l.phone||l.whatsapp));
 const key=[id,verified?1:0,number,l.address||'',l.email||''].join('|');if(contact.dataset.v129===key)return;
 chipText(card.querySelector('.chip.wa'),verified?'WhatsApp verificado':'Celular por validar');
 const parts=[];
 if(number)parts.push(`💬 ${number}`);
 if(l.address)parts.push(`📍 ${l.address}`);
 if(l.email)parts.push(`✉️ ${l.email}`);
 contact.innerHTML=parts.join('<br>');contact.dataset.v129=key;
}
function scan(){document.querySelectorAll('#grid .card').forEach(paint)}
function loadContextModule(){
 if(!document.querySelector('link[data-agp-context]')){const link=document.createElement('link');link.rel='stylesheet';link.href='prospect-context-v152.css?v=152';link.dataset.agpContext='1';document.head.appendChild(link)}
 if(!document.querySelector('script[data-agp-context]')){const script=document.createElement('script');script.src='prospect-context-v152.js?v=152';script.dataset.agpContext='1';document.body.appendChild(script)}
}
function boot(){scan();loadContextModule();const g=document.getElementById('grid');if(!g)return;let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}).observe(g,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();