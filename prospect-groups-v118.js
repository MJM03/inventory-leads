(()=>{
  'use strict';
  if(window.__AGP_PROSPECT_GROUPS_V118)return;
  window.__AGP_PROSPECT_GROUPS_V118=true;

  const read=()=>{try{return JSON.parse(localStorage.getItem('inventoryLeadOutreach')||'{}')}catch{return {}}};
  const leads=()=>window.INVENTORY_LEADS||[];

  function counts(){
    const o=read(), all=leads();
    let pending=0,sent=0,other=0;
    all.forEach(l=>{
      const s=o[l.id]||'Sin contactar';
      if(s==='Sin contactar')pending++;
      else if(s==='Mensaje enviado')sent++;
      else other++;
    });
    return {pending,sent,other,total:all.length};
  }

  function ensure(){
    const module=document.getElementById('prospectsModule');
    const toolbar=module?.querySelector('.toolbar');
    if(!module||!toolbar)return null;
    let bar=document.getElementById('agpProspectGroups');
    if(bar)return bar;
    bar=document.createElement('div');
    bar.id='agpProspectGroups';
    bar.className='agp-prospect-groups';
    bar.innerHTML=`
      <div class="agp-prospect-groups-title"><b>Control de prospectos</b><span>Separa pendientes de los ya contactados</span></div>
      <div class="agp-prospect-tabs" role="tablist" aria-label="Estado de contacto">
        <button type="button" data-status="Sin contactar" class="on"><span>Por contactar</span><b data-count="pending">0</b></button>
        <button type="button" data-status="Mensaje enviado"><span>Mensajes enviados</span><b data-count="sent">0</b></button>
        <button type="button" data-status="other"><span>Respondieron / avanzaron</span><b data-count="other">0</b></button>
        <button type="button" data-status="all"><span>Todos</span><b data-count="total">0</b></button>
      </div>`;
    toolbar.insertAdjacentElement('afterend',bar);
    bar.addEventListener('click',e=>{
      const btn=e.target.closest('button[data-status]');
      if(!btn)return;
      const status=btn.dataset.status;
      const select=document.getElementById('out');
      if(!select)return;
      if(status==='other'){
        select.value='all';
        select.dataset.agpGroup='other';
      }else{
        delete select.dataset.agpGroup;
        select.value=status;
      }
      bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===btn));
      if(status==='other')renderOther(); else select.dispatchEvent(new Event('change',{bubbles:true}));
      document.getElementById('grid')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    return bar;
  }

  function renderOther(){
    const select=document.getElementById('out');
    if(!select||select.dataset.agpGroup!=='other')return;
    const cards=[...document.querySelectorAll('#grid .card')];
    cards.forEach(card=>{
      const status=[...card.querySelectorAll('.chip')].map(x=>x.textContent.trim()).find(x=>['Sin contactar','Mensaje enviado','Respondió','Interesado','Aceptó propuesta','Seguimiento','No interesado'].includes(x));
      card.style.display=(status&&status!=='Sin contactar'&&status!=='Mensaje enviado')?'':'none';
    });
    const visible=cards.filter(c=>c.style.display!=='none').length;
    const count=document.getElementById('count');if(count)count.textContent=`${visible} visibles`;
  }

  function refresh(){
    const bar=ensure();if(!bar)return;
    const c=counts();
    Object.entries(c).forEach(([k,v])=>{const el=bar.querySelector(`[data-count="${k}"]`);if(el)el.textContent=v});
    const select=document.getElementById('out');
    if(select?.dataset.agpGroup==='other')setTimeout(renderOther,20);
  }

  document.addEventListener('change',e=>{if(e.target?.id==='out'){
    const bar=ensure();if(!bar)return;
    if(!e.target.dataset.agpGroup){bar.querySelectorAll('button').forEach(btn=>btn.classList.toggle('on',btn.dataset.status===e.target.value));}
    refresh();
  }});
  window.addEventListener('agp:firebase-sync',()=>setTimeout(refresh,50));
  window.addEventListener('storage',e=>{if(e.key==='inventoryLeadOutreach')refresh()});
  document.addEventListener('click',e=>{if(e.target.closest('.stage,.whatsapp'))setTimeout(refresh,160)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();