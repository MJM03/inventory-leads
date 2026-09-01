(()=>{if(window.__AGP_STATE_COMPAT_V103)return;window.__AGP_STATE_COMPAT_V103=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const variants=read('inventoryLeadVariants');let changed=false;const validVariants=new Set(['A','B','C']);Object.keys(variants).forEach(id=>{if(!validVariants.has(variants[id])){variants[id]='A';changed=true}});if(changed)write('inventoryLeadVariants',variants);
const replies=read('inventoryLeadReplies');const validReply=new Set(['info','price','interested','internal','person','no']);let repliesChanged=false;Object.entries(replies).forEach(([id,r])=>{if(r&&r.type&&!validReply.has(r.type)){replies[id]={...r,type:'info'};repliesChanged=true}});if(repliesChanged)write('inventoryLeadReplies',replies);
})();

/* V10.7 UX bridge: clearer session restore + explicit Equipo access on mobile. */
(()=>{
  if(window.__AGP_FIREBASE_UX_V107)return;window.__AGP_FIREBASE_UX_V107=true;
  const style=document.createElement('style');
  style.textContent=`
    .firebase-team .agp-team-label{font-weight:800;font-size:.76rem;white-space:nowrap}
    .firebase-auth-gate.agp-auth-loading .firebase-auth-form>label,
    .firebase-auth-gate.agp-auth-loading #firebaseResetButton{display:none!important}
    .firebase-auth-gate.agp-auth-loading .firebase-auth-card{position:relative}
    .firebase-auth-gate.agp-auth-loading .firebase-auth-submit{display:flex;align-items:center;justify-content:center;gap:10px;cursor:wait}
    .firebase-auth-gate.agp-auth-loading .firebase-auth-submit:before{content:"";width:17px;height:17px;border:2px solid rgba(5,32,30,.28);border-top-color:#05201e;border-radius:50%;animation:agpAuthSpin .7s linear infinite}
    .firebase-auth-gate.agp-auth-loading .firebase-auth-message{min-height:38px;text-align:center;color:#b9d8e3;line-height:1.4}
    @keyframes agpAuthSpin{to{transform:rotate(360deg)}}
    @media(max-width:640px){
      .firebase-team{min-height:42px;padding:8px 11px!important;border-radius:12px!important}
      .firebase-team .agp-team-label{display:inline!important}
      .firebase-session-copy,.firebase-role{display:none!important}
    }
  `;
  document.head.appendChild(style);

  function labelTeam(){
    const button=document.querySelector('.firebase-team');
    if(!button||button.querySelector('.agp-team-label'))return;
    const label=document.createElement('span');label.className='agp-team-label';label.textContent='Equipo';
    button.appendChild(label);button.title='Equipo AGP';button.setAttribute('aria-label','Abrir Equipo AGP');
  }

  function setLoading(text='Restaurando sesión y sincronizando datos…'){
    const gate=document.querySelector('#firebaseAuthGate');if(!gate)return;
    gate.classList.add('agp-auth-loading');gate.removeAttribute('hidden');
    const button=gate.querySelector('#firebaseLoginButton');if(button){button.disabled=true;button.textContent='Cargando tu espacio…'}
    const msg=gate.querySelector('#firebaseAuthMessage');if(msg){msg.className='firebase-auth-message';msg.textContent=text}
  }

  function setLoginReady(){
    const gate=document.querySelector('#firebaseAuthGate');if(!gate)return;
    gate.classList.remove('agp-auth-loading');
    const button=gate.querySelector('#firebaseLoginButton');if(button){button.disabled=false;button.textContent='Ingresar'}
  }

  function wire(){
    labelTeam();
    const gate=document.querySelector('#firebaseAuthGate');
    const form=document.querySelector('#firebaseLoginForm');
    if(form&&!form.dataset.ux107){
      form.dataset.ux107='1';
      form.addEventListener('submit',()=>setLoading('Validando credenciales y cargando tu información…'));
    }
    if(window.firebase?.auth){
      try{
        firebase.auth().onAuthStateChanged(user=>{
          if(user){setLoading('Sesión encontrada. Sincronizando Inventory Leads…')}
          else setLoginReady();
          setTimeout(labelTeam,250);
          setTimeout(labelTeam,900);
        });
      }catch(e){console.warn('UX Firebase',e)}
    }
    if(gate){
      const observer=new MutationObserver(()=>{
        labelTeam();
        const button=gate.querySelector('#firebaseLoginButton');
        const msg=gate.querySelector('#firebaseAuthMessage');
        if(gate.classList.contains('agp-auth-loading')&&button&&!button.disabled&&msg?.textContent&&!/cargando|sincronizando|validando|sesión/i.test(msg.textContent)) gate.classList.remove('agp-auth-loading');
      });
      observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  const teamObserver=new MutationObserver(labelTeam);teamObserver.observe(document.documentElement,{childList:true,subtree:true});
})();