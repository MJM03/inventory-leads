(()=>{
const K=['inventoryLeadOutreach','inventoryLeadMessages','inventoryLeadVariants','inventoryLeadVariantResults','inventoryLeadReplies','inventoryLeadAccepted','inventoryLeadGuidedSales','inventoryLeadStrictFlow','inventoryLeadQuoteData','agpPrintableQuote'];
const j=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
const leads=()=>window.INVENTORY_LEADS||[];
const outreach=()=>j('inventoryLeadOutreach');
const accepted=()=>j('inventoryLeadAccepted');
function dashboard(){
 let d=document.getElementById('agpDashboard');if(d)d.remove();
 d=document.createElement('section');d.id='agpDashboard';d.className='agpDashboard';
 const ls=leads(),o=outreach(),a=accepted();
 const pending=ls.filter(l=>(o[l.id]||'Sin contactar')==='Sin contactar').length;
 const sent=ls.filter(l=>(o[l.id]||'')==='Mensaje enviado').length;
 const interested=ls.filter(l=>['Respondió','Interesado','Aceptó propuesta','Seguimiento'].includes(o[l.id]||'')).length;
 const ops=Object.values(a||{});const overdue=ops.filter(x=>x&&x.nextDate&&new Date(x.nextDate+'T23:59:59')<new Date()).length;
 const quotes=ops.reduce((s,x)=>s+(Number(x?.quote)||0),0);
 d.innerHTML=`<div class="dashHead"><div><span class="miniLabel">Centro de trabajo</span><h2>Hoy en AGP</h2></div><button id="agpBackup" class="dashGhost">Respaldo</button></div><div class="dashMetrics"><button data-act="pending"><b>${pending}</b><span>Por contactar</span></button><button data-act="follow"><b>${overdue}</b><span>Seguimientos vencidos</span></button><button data-act="interested"><b>${interested}</b><span>Con respuesta/interés</span></button><button data-act="follow"><b>S/ ${Math.round(quotes)}</b><span>Cotizaciones abiertas</span></button></div><div class="dashActions"><button id="agpFollow" class="dashSecondary">Ver seguimiento</button></div><div class="dashHint">${pending?`Tienes ${pending} prospectos todavía sin contactar.`:'Ya contactaste toda la base disponible.'}${sent?` ${sent} esperan respuesta.`:''}</div>`;
 const pm=document.getElementById('prospectsModule');if(pm)pm.insertBefore(d,pm.firstChild);
 d.querySelector('[data-act="pending"]')?.addEventListener('click',()=>{const s=document.getElementById('out');if(s){s.value='Sin contactar';s.dispatchEvent(new Event('change'))}document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})});
 d.querySelectorAll('[data-act="follow"]').forEach(b=>b.onclick=()=>document.querySelector('.moduleBtn[data-module="accepted"]')?.click());
 d.querySelector('[data-act="interested"]')?.addEventListener('click',()=>{const s=document.getElementById('out');if(s){s.value='Interesado';s.dispatchEvent(new Event('change'))}document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})});
 document.getElementById('agpFollow').onclick=()=>document.querySelector('.moduleBtn[data-module="accepted"]')?.click();
 document.getElementById('agpBackup').onclick=openBackup;
 document.dispatchEvent(new CustomEvent('agpDashboardReady'));
}
function openBackup(){let dlg=document.getElementById('backupDialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='backupDialog';dlg.innerHTML=`<div class="sheet"><div class="sheetTop"><div><h2>Respaldo AGP</h2><div class="meta">Protege el seguimiento guardado en este dispositivo.</div></div><button class="close" id="backupClose">×</button></div><div class="backupActions block"><button class="btn primary wide" id="exportBackup">Exportar respaldo</button><label class="btn wide backupImport">Importar respaldo<input id="importBackup" type="file" accept="application/json" hidden></label><p>El archivo incluye estados, mensajes, respuestas, datos para cotizar, seguimiento y cotizaciones guardadas localmente.</p></div></div>`;document.body.appendChild(dlg);dlg.querySelector('#backupClose').onclick=()=>dlg.close();dlg.querySelector('#exportBackup').onclick=exportBackup;dlg.querySelector('#importBackup').onchange=importBackup}dlg.showModal()}
function exportBackup(){const data={version:1,createdAt:new Date().toISOString(),app:'AGP CRM',storage:{}};K.forEach(k=>data.storage[k]=localStorage.getItem(k));const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`AGP-respaldo-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importBackup(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.storage||x.app!=='AGP CRM')throw 0;if(!confirm('Esto reemplazará los datos locales del CRM por los del respaldo. ¿Continuar?'))return;K.forEach(k=>{if(x.storage[k]===null||x.storage[k]===undefined)localStorage.removeItem(k);else localStorage.setItem(k,x.storage[k])});location.reload()}catch{alert('El archivo no parece ser un respaldo válido de AGP.')}};r.readAsText(f)}
function boot(){dashboard();document.addEventListener('change',e=>{if(['out','followFilter','followStageFilter'].includes(e.target.id))setTimeout(dashboard,80)});window.addEventListener('storage',dashboard)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();