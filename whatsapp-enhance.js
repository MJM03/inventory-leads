(()=>{
  // Load the V3.9 researched expansion synchronously before app.js initializes.
  // This keeps the original lead base untouched and makes rollback simple.
  if(!window.__AGP_V39_LOADING){
    window.__AGP_V39_LOADING=true;
    document.write('<script src="leads-v39.js?v=39-250"><\/script>');
  }
})();

window.addEventListener('DOMContentLoaded',()=>{
  const leads=window.INVENTORY_LEADS||[];
  const clean=v=>(v||'').trim();
  leads.forEach(l=>{
    if(!clean(l.whatsapp)&&clean(l.phone)){
      l.whatsapp=l.phone;
      l.whatsappAssumed=true;
    }
  });

  const svg=`<span class="waInfoIcon" aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M19.11 17.42c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.11 2.8c.14.18 1.92 2.93 4.66 4.11.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.29.23-.63.23-1.18.16-1.29-.07-.11-.25-.18-.52-.32Z"/><path fill="currentColor" d="M16.03 3.2A12.7 12.7 0 0 0 5.25 22.63L3.2 28.8l6.35-2.01a12.73 12.73 0 1 0 6.48-23.59Zm0 22.98c-2.05 0-4.06-.55-5.82-1.6l-.42-.25-3.77 1.19 1.23-3.67-.27-.43a10.23 10.23 0 1 1 9.05 4.76Z"/></svg></span>`;
  function decorate(root=document){root.querySelectorAll?.('.contact').forEach(el=>{if(el.querySelector('.waInfoIcon'))return;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.nodeValue.includes('💬')){const parts=node.nodeValue.split('💬'),frag=document.createDocumentFragment();if(parts[0])frag.append(document.createTextNode(parts[0]));const wrap=document.createElement('span');wrap.innerHTML=svg;frag.append(wrap.firstElementChild,document.createTextNode(parts.slice(1).join('💬').replace(/^\s*/,' ')));node.parentNode.replaceChild(frag,node);break}}})}
  const css=document.createElement('style');css.textContent='.waInfoIcon{display:inline-flex;vertical-align:-3px;width:18px;height:18px;margin-right:4px;color:#25D366;flex:0 0 18px}.waInfoIcon svg{width:18px;height:18px;display:block}';document.head.appendChild(css);decorate();const obs=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){decorate(n);if(n.matches?.('.contact'))decorate(n.parentNode||document)}})));obs.observe(document.body,{childList:true,subtree:true});
});