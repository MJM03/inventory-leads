(()=>{
  const mq=window.matchMedia('(max-width:720px)');
  let nav;
  const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
  function moduleButton(name){return qsa('.moduleBtn').find(b=>b.dataset.module===name)}
  function openModule(name){const b=moduleButton(name);if(b){b.click();window.scrollTo({top:0,behavior:'smooth'})}}
  function sync(){if(!nav)return;const active=qsa('.moduleBtn').find(b=>b.classList.contains('on'))?.dataset.module||'prospects';qsa('.mobileBottomNav button').forEach(b=>b.classList.toggle('on',!!b.dataset.module&&b.dataset.module===active));const a=qs('#acceptedCount'),badge=qs('#mobileFollowBadge');if(a&&badge)badge.textContent=a.textContent==='0'?'':a.textContent;window.AGP_PENDING?.updateBadge?.()}
  function removeLegacyQuickHeaders(){qsa('.mobileQuickTop').forEach(el=>el.remove())}
  function build(){
    removeLegacyQuickHeaders();
    if(!mq.matches||nav)return;
    nav=document.createElement('nav');nav.className='mobileBottomNav';nav.setAttribute('aria-label','Navegación móvil');
    nav.innerHTML=`<button data-module="prospects" class="on"><span class="mIcon">⌂</span><span>Inicio</span></button><button data-module="accepted"><span class="mIcon">◷</span><span>Seguimiento <i id="mobileFollowBadge"></i></span></button><button data-module="quote"><span class="mIcon">S/</span><span>Cotizar</span></button><button data-action="pending"><span class="mIcon">!</span><span>Pendientes <i id="mobilePendingBadge" hidden></i></span></button>`;
    document.body.appendChild(nav);
    nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='pending')window.AGP_PENDING?.show?.();else openModule(b.dataset.module)});
    qsa('.moduleBtn').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,0)));
    const observer=new MutationObserver(sync);qsa('.moduleBtn').forEach(b=>observer.observe(b,{attributes:true,attributeFilter:['class']}));
    document.addEventListener('focusin',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))nav.style.transform='translateY(110%)'});
    document.addEventListener('focusout',()=>setTimeout(()=>{if(nav)nav.style.transform=''},120));
    window.addEventListener('agpPendingUpdated',sync);
    sync();
  }
  function destroy(){removeLegacyQuickHeaders();if(mq.matches)return;nav?.remove();nav=null}
  const boot=()=>{removeLegacyQuickHeaders();build();destroy()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('pageshow',removeLegacyQuickHeaders);
  mq.addEventListener?.('change',boot);
})();
