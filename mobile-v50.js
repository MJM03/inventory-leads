(()=>{
  const mq=window.matchMedia('(max-width:720px)');
  let nav,quick;
  const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
  function moduleButton(name){return qsa('.moduleBtn').find(b=>b.dataset.module===name)}
  function openModule(name){const b=moduleButton(name);if(b){b.click();window.scrollTo({top:0,behavior:'smooth'})}}
  function sync(){if(!nav)return;const active=qsa('.moduleBtn').find(b=>b.classList.contains('on'))?.dataset.module||'prospects';qsa('.mobileBottomNav button').forEach(b=>b.classList.toggle('on',b.dataset.module===active));const a=qs('#acceptedCount');const badge=qs('#mobileFollowBadge');if(a&&badge)badge.textContent=a.textContent==='0'?'':a.textContent}
  function doSearch(){openModule('prospects');document.body.classList.add('mobileSearchOpen');setTimeout(()=>{qs('#q')?.focus({preventScroll:true});qs('.toolbar')?.scrollIntoView({behavior:'smooth',block:'start'})},180)}
  function build(){
    if(!mq.matches||nav)return;
    nav=document.createElement('nav');nav.className='mobileBottomNav';nav.setAttribute('aria-label','Navegación móvil');
    nav.innerHTML=`<button data-module="prospects" class="on"><span class="mIcon">⌂</span><span>Inicio</span></button><button data-module="accepted"><span class="mIcon">◷</span><span>Seguimiento <i id="mobileFollowBadge"></i></span></button><button data-module="quote"><span class="mIcon">S/</span><span>Cotizar</span></button><button data-action="search"><span class="mIcon">⌕</span><span>Buscar</span></button>`;
    document.body.appendChild(nav);
    nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action==='search')doSearch();else openModule(b.dataset.module)});
    quick=document.createElement('div');quick.className='mobileQuickTop';quick.innerHTML='<div><strong>Centro comercial AGP</strong><span>Prospecta, da seguimiento y cotiza desde aquí.</span></div><button type="button">Buscar</button>';
    const target=qs('#prospectsModule');if(target)target.insertBefore(quick,target.firstChild);quick.querySelector('button').onclick=doSearch;
    qsa('.moduleBtn').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,0)));
    const observer=new MutationObserver(sync);qsa('.moduleBtn').forEach(b=>observer.observe(b,{attributes:true,attributeFilter:['class']}));
    document.addEventListener('focusin',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))nav.style.transform='translateY(110%)'});
    document.addEventListener('focusout',()=>setTimeout(()=>{if(nav)nav.style.transform=''},120));
    sync();
  }
  function destroy(){if(mq.matches)return;nav?.remove();quick?.remove();nav=null;quick=null;document.body.classList.remove('mobileSearchOpen')}
  const boot=()=>{build();destroy()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  mq.addEventListener?.('change',boot);
})();
