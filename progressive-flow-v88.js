(()=>{
if(window.__AGP_PROGRESSIVE_FLOW_V88)return;window.__AGP_PROGRESSIVE_FLOW_V88=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
const leadId=()=>{const h=document.querySelector('#modal .sheetTop h2')?.textContent?.trim();return (window.INVENTORY_LEADS||[]).find(x=>x.company===h)?.id||''};
const leadBy=id=>(window.INVENTORY_LEADS||[]).find(x=>x.id===id);
const doneCount=id=>Object.values(read('inventoryLeadGuidedSales')[id]?.checks||{}).filter(Boolean).length;
function data(id){const outreach=read('inventoryLeadOutreach')[id]||'Sin contactar',accepted=read('inventoryLeadAccepted')[id]||{},done=doneCount(id),quote=Number(accepted.quote)||0,stage=accepted.stage||'';let step=1;
 if(outreach==='Mensaje enviado')step=2;
 if(outreach==='Respondió')step=3;
 if(['Interesado','Aceptó propuesta','Seguimiento'].includes(outreach)||done>0)step=4;
 if(done>=6)step=5;
 if(quote>0||['Cotización enviada','Negociando','Fecha confirmada','Servicio realizado','Cobro pendiente','Cerrado'].includes(stage))step=6;
 if(outreach==='No interesado')step=7;
 return{outreach,accepted,done,quote,stage,step};}
const meta={
 1:{icon:'👋',title:'Primer contacto',text:'Concéntrate solo en iniciar la conversación. El objetivo es conseguir una respuesta, no vender todo de una vez.',cta:'Preparar primer mensaje'},
 2:{icon:'📤',title:'Esperar o hacer seguimiento',text:'El primer mensaje ya salió. No avances a cotización todavía; si no responde, usa un único seguimiento breve.',cta:'Ver asistencia'},
 3:{icon:'💬',title:'Entender la respuesta',text:'El prospecto respondió. Elige la situación más parecida y contesta antes de pedir todos los datos.',cta:'Abrir asistencia'},
 4:{icon:'📋',title:'Completar datos para cotizar',text:'Ahora solo reúne la información necesaria. El CRM te mostrará una pregunta por vez.',cta:'Continuar diagnóstico'},
 5:{icon:'✅',title:'Preparar cotización',text:'Ya hay información suficiente. El siguiente paso es pasar los datos al cotizador y preparar la propuesta.',cta:'Ir al cotizador'},
 6:{icon:'🤝',title:'Seguimiento y cierre',text:'La oportunidad ya pasó a cotización/seguimiento. Concéntrate en la próxima acción y en llevarla a una decisión.',cta:'Ir a seguimiento'},
 7:{icon:'—',title:'Contacto cerrado',text:'El prospecto indicó que no está interesado. No necesitas seguir avanzando este flujo.',cta:''}
};
function findInitial(m){return [...m.querySelectorAll('.block')].find(b=>b.querySelector('h3')?.textContent.trim()==='Mensaje inicial')}
function scrollTo(el){el?.scrollIntoView({behavior:'smooth',block:'start'})}
function action(id,step){const m=document.getElementById('modal');if(step===1)return scrollTo(findInitial(m));if(step===2||step===3)return scrollTo(m.querySelector('.commercialAssist79'));if(step===4)return scrollTo(m.querySelector('.quoteNext87')||m.querySelector('.guidedSales'));if(step===5){document.getElementById('detail')?.close();document.querySelector('[data-module="quote"]')?.click();const sel=document.getElementById('quoteLead');if(sel){sel.value=id;sel.dispatchEvent(new Event('change',{bubbles:true}))}return}if(step===6){document.getElementById('detail')?.close();document.querySelector('[data-module="accepted"]')?.click()}}
function gate(m,d){m.dataset.flow88=String(d.step);const initial=findInitial(m),assist=m.querySelector('.commercialAssist79'),guided=m.querySelector('.guidedSales'),next=m.querySelector('.nextStep82');
 [initial,assist,guided].forEach(x=>x?.classList.remove('flow88Focus','flow88Past','flow88Locked'));
 if(next)next.classList.add('flow88Hidden');
 if(d.step===1){initial?.classList.add('flow88Focus');assist?.classList.add('flow88Locked');guided?.classList.add('flow88Locked')}
 if(d.step===2){initial?.classList.add('flow88Past');assist?.classList.add('flow88Focus');guided?.classList.add('flow88Locked')}
 if(d.step===3){initial?.classList.add('flow88Past');assist?.classList.add('flow88Focus');guided?.classList.add('flow88Locked')}
 if(d.step===4){initial?.classList.add('flow88Past');assist?.classList.add('flow88Past');guided?.classList.add('flow88Focus')}
 if(d.step===5){initial?.classList.add('flow88Past');assist?.classList.add('flow88Past');guided?.classList.add('flow88Focus')}
 if(d.step>=6){initial?.classList.add('flow88Past');assist?.classList.add('flow88Past');guided?.classList.add('flow88Past')}
 if(guided){const offer=guided.querySelector('.gsOffer'),details=[...guided.querySelectorAll('.gsDetails')],footer=guided.querySelector('.gsFooter'),next87=m.querySelector('.quoteNext87'),ready86=m.querySelector('.quoteReadiness86');
  if(d.step===4||d.step===5){if(offer)offer.classList.add('flow88SubHidden');details.forEach((x,i)=>{x.classList.toggle('flow88SubHidden',i>0)});if(footer)footer.classList.add('flow88SubHidden');if(ready86)ready86.classList.remove('flow88SubHidden');if(next87)next87.classList.remove('flow88SubHidden')}
  else{if(offer)offer.classList.remove('flow88SubHidden');details.forEach(x=>x.classList.remove('flow88SubHidden'));if(footer)footer.classList.remove('flow88SubHidden')}
 }
}
function render(){try{const m=document.getElementById('modal'),id=leadId();if(!m||!id)return;const d=data(id),x=meta[d.step],l=leadBy(id);let box=m.querySelector('.focusFlow88');if(!box){box=document.createElement('section');box.className='focusFlow88';const top=m.querySelector('.sheetTop');top?.insertAdjacentElement('afterend',box)}
 const steps=['Contacto','Respuesta','Diagnóstico','Datos','Cotización','Seguimiento'];const active=Math.min(d.step,6);box.innerHTML=`<div class="ff88Progress">${steps.map((s,i)=>`<span class="${i+1<active?'done':i+1===active?'on':'locked'}"><i>${i+1<active?'✓':i+1}</i><em>${s}</em></span>`).join('')}</div><div class="ff88Now"><span class="ff88Icon">${x.icon}</span><div><small>ENFÓCATE SOLO EN ESTO AHORA</small><h3>${x.title}</h3><p>${x.text}</p>${d.step===4?`<b class="ff88Data">${d.done}/8 datos confirmados</b>`:''}</div></div>${x.cta?`<button type="button" class="btn primary ff88Action">${x.cta}</button>`:''}<button type="button" class="ff88History">Ver pasos anteriores</button>`;
 box.querySelector('.ff88Action')?.addEventListener('click',()=>action(id,d.step));box.querySelector('.ff88History').onclick=()=>m.classList.toggle('flow88ShowPast');gate(m,d)}catch(e){console.warn('AGP progressive flow isolated error',e)}}
function boot(){render();const m=document.getElementById('modal');if(m&&!m.__flow88obs){m.__flow88obs=true;new MutationObserver(ms=>{if(ms.some(x=>x.addedNodes.length))setTimeout(render,20)}).observe(m,{childList:true,subtree:true})}document.addEventListener('change',e=>{if(e.target?.matches?.('[data-gs-check]'))setTimeout(render,20)});document.addEventListener('click',e=>{if(e.target?.closest?.('#modal button,#modal a'))setTimeout(render,180)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();