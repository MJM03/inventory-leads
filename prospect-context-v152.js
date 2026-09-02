(()=>{
  'use strict';
  if(window.__AGP_PROSPECT_CONTEXT_V155)return;
  window.__AGP_PROSPECT_CONTEXT_V155=true;

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();

  function profileFor(lead){
    const s=norm(lead.sector), name=norm(lead.company);
    let operation='Tienda / almacén', products='Productos variados', sku='300–1,500 SKU', complexity='Media', pain='Diferencias de stock, conteos manuales y falta de visibilidad', service='Inventario físico + validación de diferencias';
    if(s.includes('importadora')||name.includes('import')){operation='Importadora / almacén comercial';products='Mercadería importada, normalmente con variedad por marca, modelo, presentación o lote';sku='800–4,000+ SKU';complexity='Media–alta';pain='Alta variedad de referencias, mercadería entrante y riesgo de diferencias por códigos similares';service='Inventario con código de barras + base de datos + validación de diferencias'}
    if(s.includes('distribuid')){operation='Distribuidora / centro de distribución';products='Cajas, unidades y referencias de alta rotación para despacho';sku='500–3,000+ SKU';complexity='Media–alta';pain='Rotación constante, picking/despacho y diferencias entre stock físico y sistema';service='Inventario físico + control de stock + validación de diferencias'}
    if(s.includes('almacen')||s.includes('logistic')||s.includes('deposit')){operation='Almacén / operación logística';products='Mercadería de múltiples clientes, ubicaciones, pallets, cajas o unidades';sku='1,000–8,000+ SKU';complexity='Alta';pain='Ubicaciones múltiples, movimientos constantes y necesidad de trazabilidad por zona';service='Inventario por zonas + códigos de barras + consolidación y reporte final'}
    if(s.includes('ferreter')){operation='Ferretería / tienda con almacén';products='Herramientas, fijaciones, accesorios, materiales y múltiples medidas/presentaciones';sku='1,500–8,000+ SKU';complexity='Alta';pain='Muchísimas referencias parecidas, unidades pequeñas y diferencias por medida/marca';service='Inventario con código de barras + validación de diferencias'}
    if(s.includes('repuesto')||s.includes('automotr')){operation='Repuestos / almacén especializado';products='Piezas por marca, modelo, año, compatibilidad y número de parte';sku='2,000–10,000+ SKU';complexity='Alta';pain='Gran cantidad de códigos y piezas visualmente similares; alto riesgo de cruces';service='Inventario por código + base de datos + validación detallada'}
    if(s.includes('tecnolog')||s.includes('comput')||s.includes('electron')){operation='Tecnología / tienda y almacén';products='Equipos, accesorios, componentes y productos con series o IMEI';sku='500–3,000+ SKU';complexity='Alta';pain='Control por serie/IMEI, accesorios similares y productos de alto valor';service='Inventario con series/IMEI + código de barras + validación'}
    if(s.includes('farmacia')||s.includes('botica')){operation='Botica / farmacia';products='Medicamentos, cuidado personal y productos con lotes/vencimientos';sku='2,000–8,000+ SKU';complexity='Alta';pain='Lotes, vencimientos, muchas presentaciones y necesidad de precisión por unidad';service='Inventario con lote + validación de diferencias + reporte'}
    if(s.includes('bebida')||s.includes('alimento')||s.includes('abarrote')||s.includes('minimarket')){operation='Consumo masivo / almacén y venta';products='Alimentos, bebidas, cajas y unidades de alta rotación';sku='500–3,500+ SKU';complexity='Media';pain='Alta rotación, cajas abiertas, unidades sueltas y diferencias por despacho/venta';service='Inventario físico + conciliación de stock + reporte'}
    if(s.includes('textil')||s.includes('moda')||s.includes('ropa')){operation='Textil / moda';products='Prendas o textiles por modelo, talla, color y colección';sku='800–5,000+ SKU';complexity='Media–alta';pain='Variantes por talla/color y referencias muy similares';service='Inventario por código + clasificación por variante + diferencias'}
    if(s.includes('industrial')||s.includes('laboratorio')||s.includes('medic')){operation='Industrial / especializado';products='Repuestos, insumos, equipos o materiales técnicos';sku='700–5,000+ SKU';complexity='Alta';pain='Referencias técnicas, unidades de alto valor y necesidad de trazabilidad';service='Inventario técnico + base de datos + validación'}
    const magnitude=complexity==='Alta'?'Operación potencialmente grande':complexity==='Media–alta'?'Operación mediana a grande':'Operación pequeña a mediana';
    const sizeScore=Number(lead.score||0),priority=sizeScore>=92?'Alta':sizeScore>=88?'Media–alta':'Media';
    return {operation,products,sku,complexity,pain,service,magnitude,priority,firstQuestion:'¿Aproximadamente cuántos SKU o productos manejan y el inventario sería de una sola sede o también de almacén?'};
  }

  function cardHTML(lead){const p=profileFor(lead);return `<section class="prospectContextCard" data-prospect-context data-lead-id="${esc(lead.id)}"><div class="prospectContextHead"><div><span class="contextEyebrow">Referencia comercial</span><h3>Contexto del prospecto</h3></div><span class="contextPriority">Prioridad ${esc(p.priority)}</span></div><div class="contextNotice"><b>Estimación AGP:</b> la magnitud y los SKU son aproximaciones según el rubro; deben confirmarse con el prospecto.</div><div class="contextGrid"><div class="contextItem"><span>Tipo de operación</span><b>${esc(p.operation)}</b></div><div class="contextItem"><span>Magnitud probable</span><b>${esc(p.magnitude)}</b></div><div class="contextItem"><span>SKU estimados</span><b>${esc(p.sku)}</b></div><div class="contextItem"><span>Complejidad</span><b>${esc(p.complexity)}</b></div></div><div class="contextSection"><span>Productos que podría manejar</span><p>${esc(p.products)}</p></div><div class="contextSection"><span>Problema probable</span><p>${esc(p.pain)}</p></div><div class="contextSection contextOpportunity"><span>Servicio AGP que mejor encaja</span><p>${esc(p.service)}</p></div><div class="contextQuestion"><span>Pregunta clave antes de cotizar</span><b>${esc(p.firstQuestion)}</b></div></section>`}

  function currentLead(modal){
    const title=modal.querySelector('.sheetTop h2, h2');
    if(!title)return null;
    const t=norm(title.textContent);
    return (window.INVENTORY_LEADS||[]).find(l=>norm(l.company)===t)||null;
  }

  function inject(){
    const modal=document.getElementById('modal');
    if(!modal||!modal.childElementCount)return;
    const lead=currentLead(modal);if(!lead)return;
    const existing=modal.querySelector('[data-prospect-context]');
    if(existing?.dataset.leadId===lead.id){existing.classList.remove('strict89Hide');return}
    existing?.remove();
    const top=modal.querySelector('.sheetTop');
    if(top){top.insertAdjacentHTML('afterend',cardHTML(lead));return}
    modal.insertAdjacentHTML('afterbegin',cardHTML(lead));
  }

  function boot(){
    const modal=document.getElementById('modal');if(!modal)return;
    let scheduled=false;
    const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;inject()})};
    new MutationObserver(schedule).observe(modal,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
    const detail=document.getElementById('detail');
    detail?.addEventListener('toggle',schedule);
    document.addEventListener('click',e=>{if(e.target.closest('[onclick*="openLead"],button,a'))setTimeout(schedule,0)},true);
    schedule();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();