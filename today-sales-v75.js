(()=>{
if(window.__AGP_TODAY_V76)return;window.__AGP_TODAY_V76=true;
const OKEY='inventoryLeadOutreach',AKEY='inventoryLeadAccepted',PKEY='agpDailySalesPlan';
const DEFAULT_ORDER=['overdue','close','reply','quote','new'];
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
const leads=()=>window.INVENTORY_LEADS||[];
const today=()=>{const d=new Date(),o=d.getTimezoneOffset();return new Date(d-o*60000).toISOString().slice(0,10)};
const money=n=>`S/ ${Math.round(Number(n)||0).toLocaleString('es-PE')}`;
function plan(){let p=parse(PKEY);if(!p||Array.isArray(p))p={};p.goal=Number(p.goal)||300;p.newContacts=Math.max(1,Number(p.newContacts)||10);p.order=Array.isArray(p.order)&&p.order.length===5?p.order:DEFAULT_ORDER.slice();return p}
function savePlan(p){localStorage.setItem(PKEY,JSON.stringify(p))}
function data(){const ls=leads(),o=parse(OKEY),a=parse(AKEY),t=today();
 const fresh=ls.filter(l=>(o[l.id]||'Sin contactar')==='Sin contactar').sort((x,y)=>(y.v7Score||y.closeScore||y.score||0)-(x.v7Score||x.closeScore||x.score||0));
 const replies=ls.filter(l=>['Respondió','Interesado'].includes(o[l.id]||''));
 const ops=Object.entries(a).filter(([,x])=>x&&x.stage!=='Cerrado');
 const overdue=ops.filter(([,x])=>x.nextDate&&x.nextDate<t);
 const quotes=ops.filter(([,x])=>Number(x.quote)>0&&['Por cotizar','Cotización enviada','Negociando','Interesado'].includes(x.stage||'Interesado'));
 const close=ops.filter(([,x])=>['Cotización enviada','Negociando','Fecha confirmada'].includes(x.stage||'')||(Number(x.probability)||0)>=70);
 const quoteValue=quotes.reduce((s,[,x])=>s+(Number(x.quote)||0),0);
 const closeValue=close.reduce((s,[,x])=>s+(Number(x.quote)||0),0);
 return {fresh,replies,overdue,quotes,close,quoteValue,closeValue};}
const cfg={
 overdue:{icon:'⏰',label:'seguimientos vencidos'},close:{icon:'🔥',label:'prospectos para intentar cerrar'},reply:{icon:'💬',label:'respuestas pendientes'},quote:{icon:'📄',label:'cotizaciones para seguir'},new:{icon:'🆕',label:'prospectos nuevos por contactar'}
};
function openProspect(id){const l=leads().find(x=>x.id===id);if(!l)return;document.querySelector('.moduleBtn[data-module="prospects"]')?.click();const q=document.getElementById('q');if(q){q.value=l.company;q.dispatchEvent(new Event('input',{bubbles:true}))}setTimeout(()=>{const c=document.querySelector('#grid .card');const b=[...(c?.querySelectorAll('button')||[])].find(x=>/ficha|ver|detalle/i.test(x.textContent));if(b)b.click();else c?.scrollIntoView({behavior:'smooth',block:'center'})},120)}
function goFollow(filter){document.querySelector('.moduleBtn[data-module="accepted"]')?.click();setTimeout(()=>{const f=document.getElementById('followFilter');if(f&&filter){f.value=filter;f.dispatchEvent(new Event('change',{bubbles:true}))}},60)}
function act(k,x){if(k==='overdue')return goFollow('overdue');if(k==='close')return goFollow('hot');if(k==='quote')return goFollow();if(k==='reply'){const l=x.replies.slice().sort((a,b)=>(b.v7Score||b.score||0)-(a.v7Score||a.score||0))[0];if(l)return openProspect(l.id)}if(k==='new'&&x.fresh[0])return openProspect(x.fresh[0].id)}
function count(k,x,p){return k==='new'?Math.min(p.newContacts,x.fresh.length):k==='reply'?x.replies.length:k==='quote'?x.quotes.length:k==='close'?x.close.length:x.overdue.length}
function move(k,dir){const p=plan(),i=p.order.indexOf(k),j=i+dir;if(i<0||j<0||j>=p.order.length)return;[p.order[i],p.order[j]]=[p.order[j],p.order[i]];savePlan(p);render()}
function render(){const host=document.getElementById('agpDashboard');if(!host)return;host.querySelector('.todaySales75')?.remove();const x=data(),p=plan();
 const cards=p.order.map((k,i)=>`<div class="ts75Item" data-k="${k}"><button class="ts75Main" type="button"><span>${cfg[k].icon}</span><b>${count(k,x,p)}</b><small>${cfg[k].label}</small>${k==='close'&&x.closeValue?`<em>${money(x.closeValue)} en juego</em>`:''}${k==='quote'&&x.quoteValue?`<em>${money(x.quoteValue)} cotizado</em>`:''}</button><div class="ts75Move"><button type="button" data-m="up" ${i===0?'disabled':''}>↑</button><button type="button" data-m="down" ${i===p.order.length-1?'disabled':''}>↓</button></div></div>`).join('');
 const box=document.createElement('section');box.className='todaySales75';box.innerHTML=`<div class="ts75Head"><div><span class="miniLabel">Prioridad del día</span><h2>Hoy debo vender</h2><p>Ordena tus prioridades y trabaja desde arriba hacia abajo.</p></div><button class="ts75Start">Empezar →</button></div><div class="ts75Goal"><div><span>Meta de ventas hoy</span><b>${money(p.goal)}</b><small>Meta editable, no una obligación.</small></div><label>S/ <input id="ts75GoalInput" type="number" min="0" step="50" value="${p.goal}"></label><div><span>Oportunidades con monto</span><b>${money(x.quoteValue)}</b><small>${x.quotes.length} cotización${x.quotes.length===1?'':'es'} activa${x.quotes.length===1?'':'s'}</small></div></div><div class="ts75List">${cards}</div><div class="ts75Hint">${x.overdue.length?'Hay seguimientos vencidos: conviene resolverlos primero.':x.close.length?'Tienes oportunidades maduras para intentar cerrar.':x.replies.length?'Hay conversaciones abiertas que conviene responder.':'Tu foco puede ser generar conversaciones nuevas.'}</div>`;
 const head=host.querySelector('.dashHead');if(head)head.after(box);else host.prepend(box);
 box.querySelectorAll('.ts75Item').forEach(item=>{const k=item.dataset.k;item.querySelector('.ts75Main').onclick=()=>act(k,x);item.querySelector('[data-m="up"]')?.addEventListener('click',()=>move(k,-1));item.querySelector('[data-m="down"]')?.addEventListener('click',()=>move(k,1))});
 const goal=box.querySelector('#ts75GoalInput');goal.onchange=()=>{const np=plan();np.goal=Math.max(0,Number(goal.value)||0);savePlan(np);render()};
 box.querySelector('.ts75Start').onclick=()=>{for(const k of p.order){if(count(k,x,p)>0)return act(k,x)}alert('No hay acciones comerciales pendientes por ahora.')};}
function boot(){render();setTimeout(render,500);const mo=new MutationObserver(()=>{clearTimeout(window.__agp75t);window.__agp75t=setTimeout(render,100)});mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('storage',render);document.addEventListener('change',e=>{if(e.target?.id!=='ts75GoalInput')setTimeout(render,100)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();