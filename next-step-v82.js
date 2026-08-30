(()=>{
if(window.__AGP_NEXT_STEP_V82)return;window.__AGP_NEXT_STEP_V82=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
function getState(id){const a=read('inventoryLeadAccepted')[id];if(a?.stage)return a.stage;return read('inventoryLeadOutreach')[id]||'Sin contactar'}
const steps={
 'Sin contactar':{icon:'🆕',title:'Enviar primer mensaje',text:'Inicia el contacto por WhatsApp. No cotices todavía: primero confirma si realizan inventarios y quién toma la decisión.',action:'whatsapp',label:'Enviar mensaje'},
 'Mensaje enviado':{icon:'📤',title:'Esperar respuesta',text:'Ya hiciste el primer contacto. Si no responde, realiza un solo seguimiento breve antes de dejarlo en pausa.',action:'assistant',label:'Ver seguimiento sugerido'},
 'Respondió':{icon:'💬',title:'Calificar la oportunidad',text:'Consigue los datos mínimos: cantidad aproximada de SKU/productos, distrito, necesidad actual y quién toma la decisión.',action:'assistant',label:'Abrir asistencia comercial'},
 'Interesado':{icon:'🔥',title:'Completar datos para cotizar',text:'Confirma volumen, ubicación, alcance, horario y fecha tentativa. Con esos datos ya puedes preparar una propuesta seria.',action:'quote',label:'Preparar cotización'},
 'Aceptó propuesta':{icon:'📄',title:'Coordinar el servicio',text:'Confirma fecha, horario, alcance y responsable del negocio. Deja registrada la próxima acción en Seguimiento.',action:'follow',label:'Ir a seguimiento'},
 'Seguimiento':{icon:'⏰',title:'Ejecutar próxima acción',text:'Revisa la fecha y acción pendiente. Evita dejar oportunidades abiertas sin un próximo contacto definido.',action:'follow',label:'Ver seguimiento'},
 'No interesado':{icon:'—',title:'Cerrar contacto',text:'No insistas. Conserva el prospecto como referencia y vuelve a contactar solo si aparece una razón comercial nueva.',action:'none',label:''},
 'Por cotizar':{icon:'📄',title:'Preparar cotización',text:'Completa volumen, alcance, equipo, horas y gastos antes de definir el precio.',action:'quote',label:'Abrir cotizador'},
 'Cotización enviada':{icon:'📤',title:'Confirmar recepción',text:'Verifica que recibió la propuesta y pregunta si necesita aclarar alcance, precio o fecha.',action:'follow',label:'Registrar seguimiento'},
 'Negociando':{icon:'🤝',title:'Resolver la objeción',text:'Identifica si la barrera es precio, alcance, fecha o confianza. Ajusta solo lo necesario y busca cerrar una fecha.',action:'assistant',label:'Ver asistencia comercial'},
 'Fecha confirmada':{icon:'📅',title:'Preparar servicio',text:'Confirma personal, horario, ubicación, alcance y responsable antes del día del inventario.',action:'follow',label:'Ver oportunidad'},
 'Servicio realizado':{icon:'✓',title:'Cerrar entrega',text:'Confirma que el cliente recibió los resultados y deja listo el cierre administrativo del servicio.',action:'follow',label:'Ver oportunidad'},
 'Cobro pendiente':{icon:'💰',title:'Gestionar pago',text:'Registra y ejecuta el seguimiento del cobro hasta completar el servicio comercialmente.',action:'follow',label:'Gestionar seguimiento'},
 'Cerrado':{icon:'✅',title:'Servicio completado',text:'Oportunidad cerrada. Conserva el historial para futuras recurrencias o nuevos inventarios.',action:'none',label:''}
};
function step(id){const s=getState(id);return steps[s]||steps['Sin contactar']}
function idFromModal(){const h=document.querySelector('#modal .sheetTop h2')?.textContent.trim();return (window.INVENTORY_LEADS||[]).find(x=>x.company===h)?.id||''}
function go(id,type){const l=(window.INVENTORY_LEADS||[]).find(x=>x.id===id);if(!l)return;if(type==='quote'&&typeof window.openQuoteFor==='function')return window.openQuoteFor(id);if(type==='follow'){document.querySelector('[data-module="accepted"]')?.click();document.getElementById('detail')?.close();return}if(type==='whatsapp'){const a=[...document.querySelectorAll('#modal a.whatsapp')][0];if(a)a.click();return}if(type==='assistant'){document.querySelector('#modal .commercialAssist79')?.scrollIntoView({behavior:'smooth',block:'start'});return}}
function install(id){const m=document.getElementById('modal');if(!m||m.querySelector('.nextStep82'))return;id=id||idFromModal();if(!id)return;const s=step(id),contact=[...m.querySelectorAll('.block')].find(b=>b.querySelector('h3')?.textContent.trim()==='Contacto');if(!contact)return;contact.insertAdjacentHTML('afterend',`<div class="block nextStep82"><div class="ns82Top"><span class="ns82Icon">${s.icon}</span><div><span class="miniLabel">Siguiente paso recomendado</span><h3>${s.title}</h3></div></div><p>${s.text}</p>${s.action!=='none'?`<button type="button" class="btn primary ns82Action">${s.label}</button>`:''}</div>`);m.querySelector('.ns82Action')?.addEventListener('click',()=>go(id,s.action))}
function boot(){const old=window.openLead;if(typeof old!=='function'||old.__ns82)return;function wrapped(id){old(id);setTimeout(()=>install(id),100)}wrapped.__ns82=true;window.openLead=wrapped}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,1100);
})();