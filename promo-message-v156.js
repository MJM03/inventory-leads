(()=>{
if(window.__AGP_PROMO_MESSAGE_V156)return;window.__AGP_PROMO_MESSAGE_V156=true;
const KEY='inventoryLeadPromoMessages';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const save=o=>localStorage.setItem(KEY,JSON.stringify(o));
const leads=()=>window.INVENTORY_LEADS||[];
const currentLead=()=>{const name=document.querySelector('#modal .sheetTop h2')?.textContent?.trim();return leads().find(x=>x.company===name)};
function focus(l){
 const s=(l?.sector||'').toLowerCase();
 if(s.includes('logíst')||s.includes('almac'))return 'en operaciones con almacenes, donde una diferencia pequeña repetida entre ubicaciones, ingresos y despachos puede terminar convirtiéndose en una pérdida importante';
 if(s.includes('import'))return 'cuando se manejan distintas líneas de mercadería, referencias y lotes, donde una diferencia de stock puede ser difícil de detectar a simple vista';
 if(s.includes('distrib'))return 'cuando existe movimiento constante de mercadería y muchas entradas y salidas, donde mantener el stock real bajo control se vuelve especialmente importante';
 if(s.includes('ferret'))return 'cuando se manejan cientos o miles de referencias distintas y pequeñas diferencias pueden acumularse sin hacerse evidentes';
 if(s.includes('tecn'))return 'cuando se manejan productos de alto valor, códigos, series o múltiples referencias y cada diferencia de stock puede representar dinero';
 if(s.includes('farm')||s.includes('botica'))return 'cuando se manejan muchas referencias, lotes y productos de alta rotación, donde conocer el stock real es fundamental';
 return 'cuando existe movimiento constante de productos, donde pequeñas diferencias de stock pueden acumularse sin que sea fácil identificar su origen';
}
function promo(l){
 return `Hola 👋, ¿qué tal? Te escribo de *AGP Inventarios*.

Sabemos que las pérdidas de dinero dentro de un negocio no siempre se ven de inmediato. Una diferencia de stock por aquí, productos que no aparecen por allá, registros que no cuadran… y al final el dinero simplemente *no está donde debería estar*.

Esto puede sentirse aún más ${focus(l)}.

Y muchas veces lo complicado no es saber que existe una pérdida, sino descubrir *por dónde se está escapando*.

Por eso, pensando en la salud, el control y la rentabilidad de tu negocio, queremos ayudarte a conocer qué tienes realmente en stock y detectar posibles diferencias antes de que sigan creciendo.

🔥 *PROMOCIÓN DE APERTURA AGP*
Por lanzamiento estamos ofreciendo *50% DE DESCUENTO en el primer servicio de inventario.*

✅ Conteo físico
✅ Lectura por código de barras
✅ Detección y validación de diferencias
✅ Consolidación y reporte final

La cotización es sin costo y la promoción está disponible por cupos de apertura.

¿Te gustaría que te prepare una cotización referencial con el *50% de descuento* aplicado? No tiene ningún compromiso.`;
}
function apply(l,box){
 const ta=box.querySelector('textarea');
 const wa=box.querySelector('a.whatsapp');
 if(!ta)return;
 const store=read(), msg=store[l.id]||promo(l);
 ta.value=msg;
 ta.dispatchEvent(new Event('input',{bubbles:true}));
 if(wa){const digits=(l.whatsapp||l.phone||'').replace(/\D/g,'');const n=digits.startsWith('51')?digits:(digits.length===9?'51'+digits:digits);wa.href='https://wa.me/'+n+'?text='+encodeURIComponent(msg)}
 box.querySelectorAll('.variantBtn').forEach(b=>b.classList.remove('on'));
 box.querySelector('.agpPromoBtn')?.classList.add('on');
 const help=box.querySelector('.variantHelp');if(help)help.textContent='🔥 Promoción de apertura: conecta el problema de pérdidas y diferencias de stock con un 50% de descuento en el primer inventario.';
}
function install(){
 const m=document.getElementById('modal'),l=currentLead();if(!m||!l)return;
 const box=[...m.querySelectorAll('.block')].find(b=>b.querySelector('h3')?.textContent?.trim()==='Mensaje inicial');
 if(!box)return;
 const tabs=box.querySelector('.variantTabs');if(!tabs||tabs.querySelector('.agpPromoBtn'))return;
 const b=document.createElement('button');b.type='button';b.className='variantBtn agpPromoBtn';b.textContent='F · Promo apertura 🔥 -50%';
 b.addEventListener('click',()=>apply(l,box));tabs.appendChild(b);
 const saveBtn=[...box.querySelectorAll('button')].find(x=>x.textContent.includes('Guardar cambios'));
 if(saveBtn){saveBtn.addEventListener('click',()=>{if(!b.classList.contains('on'))return;const o=read();o[l.id]=box.querySelector('textarea')?.value?.trim()||promo(l);save(o)},{capture:true})}
 box.querySelector('textarea')?.addEventListener('input',()=>{if(!b.classList.contains('on'))return;const wa=box.querySelector('a.whatsapp');if(wa){const digits=(l.whatsapp||l.phone||'').replace(/\D/g,'');const n=digits.startsWith('51')?digits:(digits.length===9?'51'+digits:digits);wa.href='https://wa.me/'+n+'?text='+encodeURIComponent(box.querySelector('textarea').value)}});
}
let t;const schedule=()=>{clearTimeout(t);t=setTimeout(install,80)};
const boot=()=>{const m=document.getElementById('modal');if(m&&!m.__promo156){m.__promo156=true;new MutationObserver(schedule).observe(m,{childList:true,subtree:true})}document.addEventListener('click',e=>{if(e.target.closest?.('[onclick*="openLead"],#grid .card'))setTimeout(install,180)});schedule()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();