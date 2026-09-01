(()=>{if(window.__AGP_STATE_COMPAT_V103)return;window.__AGP_STATE_COMPAT_V103=true;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return{}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const variants=read('inventoryLeadVariants');let changed=false;const validVariants=new Set(['A','B','C']);Object.keys(variants).forEach(id=>{if(!validVariants.has(variants[id])){variants[id]='A';changed=true}});if(changed)write('inventoryLeadVariants',variants);
const replies=read('inventoryLeadReplies');const validReply=new Set(['info','price','interested','internal','person','no']);let repliesChanged=false;Object.entries(replies).forEach(([id,r])=>{if(r&&r.type&&!validReply.has(r.type)){replies[id]={...r,type:'info'};repliesChanged=true}});if(repliesChanged)write('inventoryLeadReplies',replies);
})();

/* V10.8 UX: clean account strip + robust Firebase session restoration. */
(()=>{
  if(window.__AGP_FIREBASE_UX_V108)return;window.__AGP_FIREBASE_UX_V108=true;

  const EMAIL_KEY='agp:lastLoginEmail';
  let authResolved=false;

  const style=document.createElement('style');
  style.textContent=`
    .agp-account-strip{
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      margin:10px 0 14px;padding:10px 12px;border:1px solid var(--line,#dfe5ea);
      border-radius:16px;background:rgba(255,255,255,.78);backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);box-shadow:0 8px 24px rgba(13,27,42,.05)
    }
    .agp-account-status{display:flex;align-items:center;gap:9px;min-width:0;color:var(--muted,#6f7f8c);font-size:.76rem}
    .agp-account-status .firebase-sync-dot{flex:0 0 auto}
    .agp-account-copy{display:grid;min-width:0;line-height:1.12}
    .agp-account-copy b{color:var(--text,#172331);font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px}
    .agp-account-copy span{margin-top:3px;font-size:.68rem}
    .agp-account-actions{display:flex;align-items:center;gap:7px;flex:0 0 auto}
    .agp-account-strip .firebase-team,.agp-account-strip .firebase-signout{
      min-height:38px;border-radius:11px!important;padding:8px 11px!important;font-size:.74rem!important
    }
    .agp-account-strip .firebase-team{gap:7px!important;background:var(--panel,#fff)!important}
    .agp-account-strip .firebase-team .agp-team-label{display:inline!important;font-weight:800;white-space:nowrap}
    .agp-account-strip .firebase-session-copy,.agp-account-strip .firebase-role{display:none!important}
    .topactions #firebaseSession{display:none!important}

    .firebase-auth-gate{transition:opacity .16s ease}
    .firebase-auth-gate.agp-auth-checking .firebase-auth-form>label,
    .firebase-auth-gate.agp-auth-checking #firebaseResetButton{display:none!important}
    .firebase-auth-gate.agp-auth-checking .firebase-auth-card{position:relative;overflow:hidden}
    .firebase-auth-gate.agp-auth-checking .firebase-auth-card:after{
      content:"";position:absolute;left:0;right:0;bottom:0;height:3px;
      background:linear-gradient(90deg,transparent,#19b7a9,transparent);
      animation:agpAuthBar 1.15s ease-in-out infinite
    }
    .firebase-auth-gate.agp-auth-checking .firebase-auth-submit{
      display:flex;align-items:center;justify-content:center;gap:10px;cursor:wait
    }
    .firebase-auth-gate.agp-auth-checking .firebase-auth-submit:before{
      content:"";width:17px;height:17px;border:2px solid rgba(5,32,30,.28);
      border-top-color:#05201e;border-radius:50%;animation:agpAuthSpin .72s linear infinite
    }
    .firebase-auth-gate.agp-auth-checking .firebase-auth-message{
      min-height:42px;text-align:center;color:#b9d8e3;line-height:1.45;margin-top:4px
    }
    .firebase-auth-gate.agp-auth-checking .firebase-auth-brand{margin-bottom:18px}
    .agp-login-note{margin:-3px 0 1px;text-align:center;color:#8fa9b8;font-size:.72rem;line-height:1.4}
    .agp-login-security{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:3px;color:#76909e;font-size:.68rem}
    .agp-login-security:before{content:"✓";display:grid;place-items:center;width:16px;height:16px;border-radius:50%;background:rgba(25,183,169,.14);color:#6ee1d5;font-weight:900}
    @keyframes agpAuthSpin{to{transform:rotate(360deg)}}
    @keyframes agpAuthBar{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

    @media(max-width:640px){
      .agp-account-strip{margin:8px 0 12px;padding:9px 10px;border-radius:14px}
      .agp-account-copy b{max-width:145px}
      .agp-account-copy span{font-size:.65rem}
      .agp-account-strip .firebase-team,.agp-account-strip .firebase-signout{min-height:36px;padding:7px 10px!important}
    }
    @media(max-width:390px){
      .agp-account-copy b{max-width:105px}
      .agp-account-strip{gap:7px}
      .agp-account-actions{gap:5px}
      .agp-account-strip .firebase-team,.agp-account-strip .firebase-signout{padding:7px 8px!important}
    }
  `;
  document.head.appendChild(style);

  function gate(){return document.querySelector('#firebaseAuthGate')}
  function loginButton(){return document.querySelector('#firebaseLoginButton')}
  function loginMessage(){return document.querySelector('#firebaseAuthMessage')}

  function setChecking(text='Buscando una sesión guardada…'){
    const g=gate();if(!g)return;
    g.classList.add('agp-auth-checking');g.removeAttribute('hidden');
    const btn=loginButton();if(btn){btn.disabled=true;btn.textContent='Cargando tu espacio…'}
    const msg=loginMessage();if(msg){msg.className='firebase-auth-message';msg.textContent=text}
  }

  function setReady(message=''){
    const g=gate();if(!g)return;
    g.classList.remove('agp-auth-checking');
    const btn=loginButton();if(btn){btn.disabled=false;btn.textContent='Ingresar'}
    const msg=loginMessage();if(msg&&message)msg.textContent=message;
  }

  function enhanceLogin(){
    const g=gate(),form=document.querySelector('#firebaseLoginForm');if(!g||!form)return;
    if(form.dataset.ux108)return;form.dataset.ux108='1';

    const email=form.querySelector('#firebaseEmail');
    if(email){
      const remembered=localStorage.getItem(EMAIL_KEY)||'';
      if(!email.value&&remembered)email.value=remembered;
      email.addEventListener('change',()=>{const value=email.value.trim().toLowerCase();if(value)localStorage.setItem(EMAIL_KEY,value)});
    }

    const note=document.createElement('p');note.className='agp-login-note';
    note.textContent='Tu sesión se mantiene en este dispositivo hasta que pulses Salir.';
    form.querySelector('#firebaseResetButton')?.insertAdjacentElement('afterend',note);
    const security=document.createElement('div');security.className='agp-login-security';security.textContent='Acceso protegido con Firebase Authentication';
    form.appendChild(security);

    form.addEventListener('submit',()=>{
      const value=email?.value.trim().toLowerCase();if(value)localStorage.setItem(EMAIL_KEY,value);
      setChecking('Validando credenciales y sincronizando tu información…');
    });

    if(!authResolved)setChecking('Buscando una sesión guardada en este dispositivo…');
  }

  function ensureTeamLabel(button){
    if(!button||button.querySelector('.agp-team-label'))return;
    const label=document.createElement('span');label.className='agp-team-label';label.textContent='Equipo';button.appendChild(label);
    button.title='Equipo AGP';button.setAttribute('aria-label','Abrir Equipo AGP');
  }

  function relocateSession(){
    const session=document.querySelector('#firebaseSession');
    const app=document.querySelector('main.app');
    const header=app?.querySelector('.topbar');
    if(!session||!app||!header)return false;

    let strip=app.querySelector('#agpAccountStrip');
    if(!strip){
      strip=document.createElement('section');strip.id='agpAccountStrip';strip.className='agp-account-strip';
      strip.innerHTML='<div class="agp-account-status"><span class="agp-account-copy"><b>Sesión AGP</b><span>Sincronizando…</span></span></div><div class="agp-account-actions"></div>';
      header.insertAdjacentElement('afterend',strip);
    }

    const team=session.querySelector('.firebase-team');
    const signout=session.querySelector('.firebase-signout');
    ensureTeamLabel(team);

    const dot=session.querySelector('#firebaseSyncDot');
    const syncText=session.querySelector('#firebaseSyncText');
    const email=session.querySelector('.firebase-session-copy b');
    const role=session.querySelector('.firebase-role');
    const status=strip.querySelector('.agp-account-status');
    const copy=strip.querySelector('.agp-account-copy');
    if(dot&&dot.parentElement!==status)status.prepend(dot);
    if(copy){
      const b=copy.querySelector('b'),span=copy.querySelector('span');
      if(b)b.textContent=email?.textContent||'Sesión AGP';
      if(span)span.textContent=[syncText?.textContent,role?.textContent].filter(Boolean).join(' · ')||'Sincronizado';
    }
    const actions=strip.querySelector('.agp-account-actions');
    if(team&&team.parentElement!==actions)actions.appendChild(team);
    if(signout&&signout.parentElement!==actions)actions.appendChild(signout);
    return true;
  }

  function syncStripText(){
    const strip=document.querySelector('#agpAccountStrip');if(!strip)return;
    const session=document.querySelector('#firebaseSession');
    const email=session?.querySelector('.firebase-session-copy b')?.textContent;
    const sync=session?.querySelector('#firebaseSyncText')?.textContent;
    const role=session?.querySelector('.firebase-role')?.textContent;
    const b=strip.querySelector('.agp-account-copy b'),span=strip.querySelector('.agp-account-copy span');
    if(b&&email)b.textContent=email;
    if(span)span.textContent=[sync,role].filter(Boolean).join(' · ')||'Sincronizado';
  }

  function startRelocationBurst(){
    let tries=0;const timer=setInterval(()=>{tries++;relocateSession();syncStripText();if(tries>30)clearInterval(timer)},120);
  }

  function init(){
    enhanceLogin();
    if(window.firebase?.auth){
      try{
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
        firebase.auth().onAuthStateChanged(user=>{
          authResolved=true;
          if(user){
            sessionStorage.setItem(`firebaseReady106:${user.uid}`,'1');
            if(user.email)localStorage.setItem(EMAIL_KEY,user.email);
            setChecking('Sesión encontrada. Sincronizando Inventory Leads…');
            startRelocationBurst();
          }else{
            setReady();
            document.querySelector('#agpAccountStrip')?.remove();
          }
        });
      }catch(e){console.warn('Firebase UX V10.8',e);setReady('No pudimos comprobar la sesión. Puedes intentar ingresar manualmente.')}
    }else setReady();

    window.addEventListener('online',()=>{syncStripText();startRelocationBurst()});
    window.addEventListener('agp:firebase-sync',()=>{syncStripText();startRelocationBurst()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();