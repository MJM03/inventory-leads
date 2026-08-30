(()=>{
if(window.__AGP_QUOTE_NEXT_V87)return;window.__AGP_QUOTE_NEXT_V87=true;
const KEY='inventoryLeadGuidedSales';
const fields=[
 ['volume','Cantidad aproximada de SKU / productos','Para poder dimensionar el inventario, ¿aproximadamente cuántos productos o SKU manejan?'],
 ['zone','Distrito / ubicación','¿En qué distrito se encuentra el local o almacén donde realizaríamos el inventario?'],
 ['areas','Ambientes / pisos / almacenes','¿El inventario está concentrado en un solo ambiente o tienen varias áreas, pisos o almacenes?'],
 ['codes','Códigos de barras','¿La mayoría de sus productos cuenta con código de barras o también manejan productos sin código?'],
 ['serials','IMEI / series / lotes','¿Manejan productos que necesiten control por IMEI, número de serie o lote?'],
 ['order','Nivel de orden','¿Actualmente la mercadería está ordenada por zonas o referencias, o se encuentra mezclada?'],
 ['schedule','Fecha y horario','¿Para qué fecha y horario aproximadamente les gustaría realizar el inventario?'],
 ['differences','Revisión de diferencias','¿Necesitan que además del conteo revisemos las diferencias entre el stock físico y su registro actual?']
];
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
function leadId(){const h=document.querySelector('#modal .sheetTop h2')?.textContent?.trim();return (window.INVENTORY_LEADS||[]).find(x=>x.company===h)?.id||''}
function state(id){return read()[id]?.checks||{}}
function missing(id){const c=state(id);return fields.filter(([k])=>!c[k])}
function waLink(id,text){const l=(window.INVENTORY_LEADS||[]).find(x=>x.id===id);let n=String(l?.whatsapp||l?.phone||'').replace(/\D/g,'');if(/^9\d{8}$/.test(n))n='51'+n;return /^519\d{8}$/.test(n)?`https://wa.me/${n}?text=${encodeURIComponent(text)}`:''}
async function copy(text,btn){try{await navigator.clipboard.writeText(text);const old=btn.textContent;btn.textContent='Copiado ✓';setTimeout(()=>btn.textContent=old,1200)}catch{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}}
function render(box,id){const miss=missing(id),n=fields.length-miss.length;box.innerHTML='';if(n>=6){box.dataset.state='ready';box.innerHTML=`<div class="qn87Head"><span>✅</span><div><small>SIGUIENTE ACCIÓN</small><b>Ya puedes preparar la cotización</b></div></div><p>Tienes ${n}/8 datos confirmados. Puedes cotizar ahora y completar los detalles restantes antes de cerrar el servicio.</p><button type="button" class="btn primary qn87Quote">Listo para cotizar →</button>`;box.querySelector('.qn87Quote').onclick=()=>{document.getElementById('detail')?.close();document.querySelector('[data-module="quote"]')?.click();const sel=document.getElementById('quoteLead');if(sel){sel.value=id;sel.dispatchEvent(new Event('change',{bubbles:true}))}};return}
const f=miss[0];if(!f)return;box.dataset.state='ask';box.innerHTML=`<div class="qn87Head"><span>💬</span><div><small>PREGUNTA RECOMENDADA AHORA</small><b>${f[1]}</b></div></div><p>Pregunta solo este dato para que la conversación siga natural.</p><textarea class="ctl qn87Text" rows="3">${f[2]}</textarea><div class="qn87Actions"><button type="button" class="btn qn87Copy">Copiar pregunta</button><button type="button" class="btn whatsapp qn87Wa">Abrir WhatsApp</button></div><div class="qn87Pending">Después quedarán ${Math.max(0,miss.length-1)} datos por confirmar.</div>`;const text=()=>box.querySelector('.qn87Text').value.trim();box.querySelector('.qn87Copy').onclick=e=>copy(text(),e.currentTarget);const wb=box.querySelector('.qn87Wa');wb.onclick=()=>{const url=waLink(id,text());if(url)window.open(url,'_blank','noopener');else{wb.textContent='Sin WhatsApp disponible';setTimeout(()=>wb.textContent='Abrir WhatsApp',1400)}}}
function install(){try{const host=document.getElementById('modal'),ready=host?.querySelector('.quoteReadiness86');if(!host||!ready)return;const id=leadId();if(!id)return;let box=host.querySelector('.quoteNext87');if(!box){box=document.createElement('div');box.className='quoteNext87';ready.insertAdjacentElement('afterend',box)}render(box,id)}catch(e){console.warn('AGP quote next question isolated error',e)}}
function boot(){install();const modal=document.getElementById('modal');if(modal&&!modal.__qn87obs){modal.__qn87obs=true;new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length))setTimeout(install,0)}).observe(modal,{childList:true,subtree:true})}document.addEventListener('change',e=>{if(e.target?.matches?.('[data-gs-check]'))setTimeout(install,10)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();