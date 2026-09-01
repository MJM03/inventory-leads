(()=>{
  'use strict';
  if(window.__AGP_SAFARI_AUTH_V110)return;
  window.__AGP_SAFARI_AUTH_V110=true;
  if(!window.firebase?.auth)return;

  const ua=navigator.userAgent||'';
  const isSafari=/Safari/i.test(ua)&&!/CriOS|Chrome|FxiOS|EdgiOS|OPiOS/i.test(ua);
  if(!isSafari)return;

  try{
    const auth=firebase.auth();
    if(!auth||auth.__agpSafariPersistencePatched)return;
    auth.__agpSafariPersistencePatched=true;

    // Firebase Auth already defaults to LOCAL persistence in browsers.
    // On Safari/iOS, explicitly switching persistence can occasionally hang
    // while the SDK negotiates its storage backend. Avoid that extra migration
    // and keep the existing/default local session instead.
    auth.setPersistence=function(){
      return Promise.resolve();
    };

    window.__AGP_SAFARI_AUTH_WORKAROUND=true;
  }catch(error){
    console.warn('No se pudo aplicar compatibilidad de sesión para Safari',error);
  }
})();
