(()=>{
if(window.__AGP_CONTACT_DISPLAY_V128)return;window.__AGP_CONTACT_DISPLAY_V128=true;
const leads=()=>window.INVENTORY_LEADS||[];
function idFromCard(card){const b=card.querySelector('[onclick*="openLead"]');return b?.getAttribute('onclick')?.match(/openLead\(['"]([^'"]+)/)?.[1]||''}
function paint(card){
  const id=idFromCard(card),l=leads().find(x=>x.id===id);if(!l)return;
  const contact=card.querySelector('.contact');if(!contact)return;
  const wa=(l.whatsapp||'').trim(),phone=(l.phone||'').trim();
  const chip=card.querySelector('.chip.wa');
  if(wa){
    if(chip)chip.childNodes[chip.childNodes.length-1].textContent=' WhatsApp verificado';
    const icon=contact.querySelector('.waIcon');
    if(icon && !contact.dataset.contactNumber128){icon.insertAdjacentText('afterend',' '+wa);contact.dataset.contactNumber128='1'}
    return;
  }
  if(chip){
    const svg=chip.querySelector('svg');chip.textContent='Celular por validar';if(svg)chip.prepend(svg);
  }
  const icon=contact.querySelector('.waIcon');
  if(icon&&phone&&!contact.dataset.contactNumber128){icon.insertAdjacentText('afterend',' '+phone);contact.dataset.contactNumber128='1'}
}
function scan(){document.querySelectorAll('#grid .card').forEach(paint)}
function boot(){scan();const g=document.getElementById('grid');if(!g)return;new MutationObserver(()=>requestAnimationFrame(scan)).observe(g,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();