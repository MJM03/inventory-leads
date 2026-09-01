(()=>{
  'use strict';
  if(window.__AGP_SETTINGS_V111)return;
  window.__AGP_SETTINGS_V111=true;

  function icon(){return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.37.34.7.6 1 .3.27.68.4 1.1.4h.1v4h-.1c-.42 0-.8.13-1.1.4-.26.3-.47.63-.6 1Z"/></svg>`}

  function build(){
    if(document.querySelector('#agpSettingsBtn'))return;
    const nav=document.querySelector('.moduleNav');
    if(!nav)return;
    const btn=document.createElement('button');
    btn.id='agpSettingsBtn'; btn.className='moduleBtn agp-settings-btn'; btn.type='button';
    btn.innerHTML=`${icon()}<span>Configuración</span>`;
    nav.appendChild(btn);

    const dialog=document.createElement('dialog');
    dialog.id='agpSettingsDialog'; dialog.className='agp-settings-dialog';
    dialog.innerHTML=`<div class="agp-settings-sheet"><div class="agp-settings-head"><div><span class="miniLabel">APLICACIÓN</span><h2>Configuración</h2></div><button class="agp-settings-close" type="button" aria-label="Cerrar">×</button></div><button class="agp-settings-row agp-updates-row" type="button"><span class="agp-settings-row-icon">◷</span><span><b>Actualizaciones</b><small>Ver historial de mejoras</small></span><span class="agp-chevron">›</span></button><div class="agp-settings-sync"><span id="agpSettingsSyncDot" class="firebase-sync-dot"></span><span><b>Sincronización</b><small id="agpSettingsSyncText">Conectando…</small></span></div><button class="agp-settings-row danger agp-signout-row" type="button"><span class="agp-settings-row-icon">↪</span><span><b>Cerrar sesión</b><small>Salir de este dispositivo</small></span><span class="agp-chevron">›</span></button></div>`;
    document.body.appendChild(dialog);
    btn.addEventListener('click',()=>dialog.showModal());
    dialog.querySelector('.agp-settings-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog.querySelector('.agp-updates-row').addEventListener('click',()=>{dialog.close(); document.querySelector('#updatesBtn')?.click();});
    dialog.querySelector('.agp-signout-row').addEventListener('click',()=>{dialog.close(); document.querySelector('#firebaseSession .firebase-signout')?.click();});
    syncStatus();
  }

  function syncStatus(){
    const source=document.querySelector('#firebaseSyncText');
    const target=document.querySelector('#agpSettingsSyncText');
    const sourceDot=document.querySelector('#firebaseSyncDot');
    const targetDot=document.querySelector('#agpSettingsSyncDot');
    if(target&&source)target.textContent=source.textContent;
    if(targetDot)targetDot.classList.toggle('online',!!sourceDot?.classList.contains('online'));
  }
  window.addEventListener('agp:firebase-sync',syncStatus);
  setInterval(syncStatus,1500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true}); else build();
})();