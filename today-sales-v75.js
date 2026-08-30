(()=>{
if(window.__AGP_TODAY_V75)return;window.__AGP_TODAY_V75=true;
const OKEY='inventoryLeadOutreach',AKEY='inventoryLeadAccepted';
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
const leads=()=>window.INVENTORY_LEADS||[];
const today=()=>{const d=new Date(),o=d.getTimezoneOffset();return new Date(d-o*60000).toISOString().slice(0,10)};
function data(){const ls=leads(),o=parse(OKEY),a=parse(AKEY),t=today();
 const fresh=ls.filter(l=>(o[l.id]||'Sin contactar')==='Sin contactar').sort((x,y)=>(y.v7Score||y.closeScore||y.score||0)-(x.v7Score||x.closeScore||x.score||0));
 const replies=ls.filter(l=>['Respondió','Interesado'].includes(o[l.id]||''));
 const ops=Object.entries(a).filter(([,x])=>x&&x.stage!=='Cerrado');
 const overdue=ops.filter(([,x])=>x.nextDate&&x.nextDate<t);
 const quotes=ops.filter(([,x])=>Number(x.quote)>0&&['Por cotizar','Cotización enviada','Negociando','Interesado'].includes(x.stage||'Interesado'));
 const close=ops.filter(([,x])=>['Cotización enviada','Negociando','Fecha confirmada'].includes(x.stage||'')||(Number(x.probability)||0)>=70);
 return {fresh,replies,overdue,quotes,close};}
function openProspect(id){const l=leads().find(x=>x.id===id);if(!l)return;document.querySelector('.moduleBtn[data-module="prospects"]')?.click();const q=document.getElementById('q');if(q){q.value=l.company;q.dispatchEvent(new Event('input',{bubbles:true}))}setTimeout(()=>{const c=document.querySelector('#grid .card');const b=[...(c?.querySelectorAll('button')||[])].find(x=>/ficha|ver|detalle/i.test(x.textContent));if(b)b.click();else c?.scrollIntoView({behavior:'smooth',block:'center'})},120)}
function goFollow(filter){document.querySelector('.moduleBtn[data-module="accepted"]')?.click();setTimeout(()=>{const f=document.getElementById('followFilter');if(f&&filter){f.value=filter;f.dispatchEvent(new Event('change',{bubbles:true}))}},60)}
function render(){const host=document.getElementById('agpDashboard');if(!host)return;let old=host.querySelector('.todaySales75');if(old)old.remove();const x=data(),newGoal=Math.min(10,x.fresh.length);
 const box=document.createElement('section');box.className='todaySales75';box.innerHTML=`<div class="ts75Head"><div><span class="miniLabel">Prioridad del día</span><h2>Hoy debo vender</h2><p>Una lista corta de acciones para mover oportunidades y generar conversaciones nuevas.</p></div><button class="ts75Start">Empezar →</button></div><div class="ts75List"><button data-k="close"><span>🔥</span><b>${x.close.length}</b><small>prospectos para intentar cerrar</small></button><button data-k="reply"><span>💬</span><b>${x.replies.length}</b><small>respuestas pendientes</small></button><button data-k="quote"><span>📄</span><b>${x.quotes.length}</b><small>cotizaciones para seguir</small></button><button data-k="overdue"><span>⏰</span><b>${x.overdue.length}</b><small>seguimientos vencidos</small></button><button data-k="new"><span>🆕</span><b>${newGoal}</b><small>prospectos nuevos por contactar</small></button></div><div class="ts75Hint">${x.overdue.length?'Empieza por los seguimientos vencidos.':x.close.length?'Tienes oportunidades maduras: intenta avanzar una hacia fecha confirmada.':x.replies.length?'Responde primero a quienes ya abrieron conversación.':'Genera actividad nueva contactando los prospectos con mayor prioridad.'}</div>`;
 const head=host.querySelector('.dashHead');if(head)head.after(box);else host.prepend(box);
 box.querySelector('[data-k="overdue"]').onclick=()=>goFollow('overdue');box.querySelector('[data-k="quote"]').onclick=()=>goFollow();box.querySelector('[data-k="close"]').onclick=()=>goFollow('hot');
 box.querySelector('[data-k="reply"]').onclick=()=>{const l=x.replies.sort((a,b)=>(b.v7Score||b.score||0)-(a.v7Score||a.score||0))[0];if(l)openProspect(l.id)};
 box.querySelector('[data-k="new"]').onclick=()=>{if(x.fresh[0])openProspect(x.fresh[0].id)};
 box.querySelector('.ts75Start').onclick=()=>{if(x.overdue.length)return goFollow('overdue');if(x.close.length)return goFollow('hot');if(x.replies[0])return openProspect(x.replies[0].id);if(x.quotes.length)return goFollow();if(x.fresh[0])return openProspect(x.fresh[0].id);alert('No hay acciones comerciales pendientes por ahora.')};}
function boot(){render();setTimeout(render,500);const mo=new MutationObserver(()=>{clearTimeout(window.__agp75t);window.__agp75t=setTimeout(render,80)});mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('storage',render);document.addEventListener('change',()=>setTimeout(render,80));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();