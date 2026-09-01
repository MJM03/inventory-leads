(()=>{
  'use strict';
  if(window.__AGP_SETTINGS_V113)return;
  window.__AGP_SETTINGS_V113=true;

  function gearIcon(){return '⚙'}

  function ensureDialog(){
    let dialog=document.querySelector('#agpSettingsDialog');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='agpSettingsDialog'; dialog.className='agp-settings-dialog';
    dialog.innerHTML=`<div class="agp-settings-sheet"><div class="agp-settings-head"><div><span class="miniLabel">APLICACIÓN</span><h2>Configuración</h2></div><button class="agp-settings-close" type="button" aria-label="Cerrar">×</button></div><button class="agp-settings-row agp-updates-row" type="button"><span class="agp-settings-row-icon">◷</span><span><b>Actualizaciones</b><small>Ver historial de mejoras</small></span><span class="agp-chevron">›</span></button><div class="agp-settings-sync"><span id="agpSettingsSyncDot" class="firebase-sync-dot"></span><span><b>Sincronización</b><small id="agpSettingsSyncText">Conectando…</small></span></div><button class="agp-settings-row danger agp-signout-row" type="button"><span class="agp-settings-row-icon">↪</span><span><b>Cerrar sesión</b><small>Salir de este dispositivo</small></span><span class="agp-chevron">›</span></button></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('.agp-settings-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog.querySelector('.agp-updates-row').addEventListener('click',()=>{dialog.close(); document.querySelector('#updatesBtn')?.click();});
    dialog.querySelector('.agp-signout-row').addEventListener('click',()=>{dialog.close(); document.querySelector('#firebaseSession .firebase-signout')?.click();});
    return dialog;
  }

  function openSettings(){
    const dialog=ensureDialog();
    if(!dialog.open)dialog.showModal();
    syncStatus();
  }

  function ensureDesktopButton(){
    const nav=document.querySelector('.moduleNav');
    if(!nav||document.querySelector('#agpSettingsBtn'))return;
    const btn=document.createElement('button');
    btn.id='agpSettingsBtn'; btn.className='moduleBtn agp-settings-btn'; btn.type='button';
    btn.innerHTML=`<span>${gearIcon()}</span><span>Configuración</span>`;
    btn.addEventListener('click',openSettings);
    nav.appendChild(btn);
  }

  function ensureMobileButton(){
    const nav=document.querySelector('.mobileBottomNav');
    if(!nav)return false;
    nav.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
    let btn=nav.querySelector('[data-action="settings"]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.dataset.action='settings';
      btn.innerHTML=`<span class="mIcon">${gearIcon()}</span><span>Config.</span>`;
      nav.appendChild(btn);
    }
    if(!btn.__agpSettingsBound){
      btn.__agpSettingsBound=true;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openSettings();});
    }
    return true;
  }

  function build(){
    ensureDialog();
    ensureDesktopButton();
    ensureMobileButton();
    let attempts=0;
    const timer=setInterval(()=>{
      attempts+=1;
      ensureMobileButton();
      if(attempts>=20)clearInterval(timer);
    },250);
  }

  function syncStatus(){
    const source=document.querySelector('#firebaseSyncText');
    const target=document.querySelector('#agpSettingsSyncText');
    const sourceDot=document.querySelector('#firebaseSyncDot');
    const targetDot=document.querySelector('#agpSettingsSyncDot');
    if(target)target.textContent=source?.textContent||'Sincronización activa';
    if(targetDot)targetDot.classList.toggle('online',!!sourceDot?.classList.contains('online'));
  }

  window.addEventListener('agp:firebase-sync',syncStatus);
  setInterval(syncStatus,1500);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true}); else build();
})();