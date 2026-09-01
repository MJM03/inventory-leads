(() => {
  'use strict';

  const firebaseConfig = {
    apiKey: 'AIzaSyBEieYMJQwEilw7UylQFWJwVC2jMoL8rtw',
    authDomain: 'inventory-leads.firebaseapp.com',
    projectId: 'inventory-leads',
    storageBucket: 'inventory-leads.firebasestorage.app',
    messagingSenderId: '295339658757',
    appId: '1:295339658757:web:241fa689a86bb92a32966c',
  };
  const workspaceId = 'agp-inventory-leads';
  const VERSION = '11.0';
  const syncedKeys = [
    'inventoryLeadOutreach','inventoryLeadMessages','inventoryLeadVariants',
    'inventoryLeadVariantResults','inventoryLeadReplies','inventoryLeadAccepted',
    'inventoryLeadGuidedSales','inventoryLeadStrictFlow','inventoryLeadQuoteData',
    'inventoryLeadHistory','inventoryLeadSales','agpPrintableQuote','agpDailySalesPlan'
  ];

  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const nativeGet = Storage.prototype.getItem;
  let currentUser = null;
  let workspaceRef = null;
  let unsubscribeWorkspace = null;
  let syncReady = false;
  let applyingCloud = false;
  let lastSignature = '';

  if (!window.firebase) {
    console.error('Firebase SDK no pudo cargarse.');
    return;
  }
  if (!firebase.apps?.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  function parse(value, fallback = {}) {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  }
  function localState() {
    return syncedKeys.reduce((state, key) => {
      state[key] = parse(nativeGet.call(localStorage, key));
      return state;
    }, {});
  }
  function signature(state = localState()) {
    return JSON.stringify(syncedKeys.map((key) => [key, state?.[key] || {}]));
  }
  function friendlyError(error) {
    const messages = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
      'auth/user-disabled': 'Este usuario fue deshabilitado.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      'auth/invalid-email': 'Ingresa un correo válido.',
      'auth/missing-password': 'Ingresa tu contraseña.',
      'auth/network-request-failed': 'No se pudo conectar. Revisa tu internet.',
      'permission-denied': 'Tu cuenta no tiene acceso a los datos compartidos.'
    };
    return messages[error?.code] || 'No se pudo completar la operación.';
  }

  function buildGate() {
    if (document.querySelector('#firebaseAuthGate')) return;
    const gate = document.createElement('section');
    gate.id = 'firebaseAuthGate';
    gate.className = 'firebase-auth-gate is-restoring';
    gate.innerHTML = `<div class="firebase-auth-card"><div class="firebase-auth-brand"><img alt="AGP"><div><h1>Inventory Leads</h1><p>Acceso seguro al CRM de AGP</p></div></div><form id="firebaseLoginForm" class="firebase-auth-form"><label>Correo electrónico<input id="firebaseEmail" type="email" autocomplete="username" required placeholder="usuario@correo.com"></label><label>Contraseña<input id="firebasePassword" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label><button id="firebaseLoginButton" class="firebase-auth-submit" type="submit" disabled>Comprobando sesión…</button><button id="firebaseResetButton" class="firebase-auth-link" type="button">Olvidé mi contraseña</button><p id="firebaseAuthMessage" class="firebase-auth-message" role="status">Buscando una sesión guardada…</p></form></div>`;
    gate.querySelector('.firebase-auth-brand img').src = window.AGP_LOGO || 'agp-logo.jpg';
    document.body.appendChild(gate);
    const form = gate.querySelector('#firebaseLoginForm');
    const email = gate.querySelector('#firebaseEmail');
    const password = gate.querySelector('#firebasePassword');
    const message = gate.querySelector('#firebaseAuthMessage');
    const remembered = nativeGet.call(localStorage, 'agpLastLoginEmail');
    if (remembered) email.value = remembered;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const address = email.value.trim().toLowerCase();
      if (!address || !password.value) return;
      nativeSet.call(localStorage, 'agpLastLoginEmail', address);
      setGateLoading('Validando credenciales…');
      try {
        await auth.signInWithEmailAndPassword(address, password.value);
        password.value = '';
      } catch (error) {
        showLoginForm(friendlyError(error));
      }
    });

    gate.querySelector('#firebaseResetButton').addEventListener('click', async () => {
      const address = email.value.trim();
      if (!address) { message.textContent = 'Escribe primero tu correo electrónico.'; return; }
      try {
        await auth.sendPasswordResetEmail(address);
        message.className = 'firebase-auth-message ok';
        message.textContent = 'Te enviamos un enlace para restablecer tu contraseña.';
      } catch (error) {
        message.className = 'firebase-auth-message';
        message.textContent = friendlyError(error);
      }
    });
  }

  function setGateLoading(text) {
    const gate = document.querySelector('#firebaseAuthGate');
    if (!gate) return;
    gate.hidden = false;
    gate.classList.add('is-restoring');
    const button = gate.querySelector('#firebaseLoginButton');
    const message = gate.querySelector('#firebaseAuthMessage');
    if (button) { button.disabled = true; button.textContent = 'Cargando…'; }
    if (message) { message.className = 'firebase-auth-message'; message.textContent = text; }
  }
  function showLoginForm(text = '') {
    const gate = document.querySelector('#firebaseAuthGate');
    if (!gate) return;
    gate.hidden = false;
    gate.classList.remove('is-restoring');
    const button = gate.querySelector('#firebaseLoginButton');
    const message = gate.querySelector('#firebaseAuthMessage');
    if (button) { button.disabled = false; button.textContent = 'Ingresar'; }
    if (message) { message.className = 'firebase-auth-message'; message.textContent = text; }
  }
  function hideGate() { document.querySelector('#firebaseAuthGate')?.setAttribute('hidden',''); }

  function setOnline(ok, text = ok ? 'Sincronizado' : 'Sin conexión') {
    document.querySelector('#firebaseSyncDot')?.classList.toggle('online', ok);
    const label = document.querySelector('#firebaseSyncText');
    if (label) label.textContent = text;
  }

  function buildSessionBar(user) {
    document.querySelector('#firebaseSession')?.remove();
    const header = document.querySelector('.topbar');
    if (!header) return;
    const bar = document.createElement('div');
    bar.id = 'firebaseSession';
    bar.className = 'firebase-workspace-bar';
    bar.innerHTML = `<div class="firebase-workspace-status"><span id="firebaseSyncDot" class="firebase-sync-dot"></span><div class="firebase-workspace-copy"><b>Datos compartidos</b><span class="firebase-user-email">${user.email || 'Usuario'}</span><span id="firebaseSyncText">Sincronizando…</span></div></div><div class="firebase-workspace-actions"><button class="firebase-signout" type="button">Salir</button></div>`;
    header.insertAdjacentElement('afterend', bar);
    bar.querySelector('.firebase-signout').addEventListener('click', async () => {
      syncReady = false;
      setGateLoading('Cerrando sesión…');
      await auth.signOut();
    });
  }

  function showApp(user) {
    const app = document.querySelector('main.app');
    if (app) app.hidden = false;
    buildSessionBar(user);
    hideGate();
  }

  async function ensureWorkspace(user) {
    let snapshot = await workspaceRef.get();
    if (!snapshot.exists) {
      await workspaceRef.set({
        name: 'AGP Inventory Leads', version: VERSION, state: localState(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: { uid: user.uid, email: user.email || '' },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: user.uid, email: user.email || '' }
      });
      snapshot = await workspaceRef.get();
    }
    return snapshot.data() || {};
  }

  async function applyInitialCloud(data) {
    const cloud = data?.state || null;
    applyingCloud = true;
    try {
      if (cloud) {
        syncedKeys.forEach((key) => nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})));
      } else {
        await workspaceRef.set({ state: localState() }, { merge: true });
      }
    } finally {
      applyingCloud = false;
      lastSignature = signature();
    }
  }

  function syncMutableObject(target, source) {
    if (!target || typeof target !== 'object') return;
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, source || {});
  }
  function softRefresh(cloud) {
    try {
      if (typeof saved !== 'undefined') syncMutableObject(saved, cloud.inventoryLeadOutreach);
      if (typeof custom !== 'undefined') syncMutableObject(custom, cloud.inventoryLeadMessages);
      if (typeof variants !== 'undefined') syncMutableObject(variants, cloud.inventoryLeadVariants);
      if (typeof results !== 'undefined') syncMutableObject(results, cloud.inventoryLeadVariantResults);
      if (typeof replies !== 'undefined') syncMutableObject(replies, cloud.inventoryLeadReplies);
      if (typeof accepted !== 'undefined') syncMutableObject(accepted, cloud.inventoryLeadAccepted);
      if (typeof leads !== 'undefined') {
        const outreach = cloud.inventoryLeadOutreach || {};
        leads.forEach((lead) => { lead.outreach = outreach[lead.id] || 'Sin contactar'; });
      }
      if (typeof drawStats === 'function') drawStats();
      if (typeof render === 'function') render();
      if (typeof renderAccepted === 'function') renderAccepted();
      window.AGP_PENDING?.updateBadge?.();
      window.dispatchEvent(new CustomEvent('agp:firebase-sync', { detail: { remote: true } }));
    } catch (error) {
      console.warn('Actualización visual parcial', error);
    }
  }

  async function writeCloud(key, value) {
    if (!syncReady || applyingCloud || !currentUser || !workspaceRef) return;
    try {
      setOnline(false, 'Guardando…');
      await workspaceRef.set({
        state: { [key]: parse(value) }, version: VERSION,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || '' }
      }, { merge: true });
      lastSignature = signature();
      setOnline(true);
    } catch (error) {
      console.error('No se pudo sincronizar con Firestore', error);
      setOnline(false, 'Error de sincronización');
    }
  }

  Storage.prototype.setItem = function(key, value) {
    nativeSet.call(this, key, value);
    if (this === localStorage && syncedKeys.includes(key)) {
      lastSignature = signature();
      writeCloud(key, value);
    }
  };
  Storage.prototype.removeItem = function(key) {
    nativeRemove.call(this, key);
    if (this === localStorage && syncedKeys.includes(key)) {
      lastSignature = signature();
      writeCloud(key, '{}');
    }
  };

  function watchWorkspace() {
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = workspaceRef.onSnapshot((snapshot) => {
      if (!snapshot.exists || !syncReady) return;
      const cloud = snapshot.data()?.state || {};
      const cloudSignature = signature(cloud);
      if (cloudSignature === lastSignature || snapshot.metadata.hasPendingWrites) return;
      applyingCloud = true;
      syncedKeys.forEach((key) => nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})));
      applyingCloud = false;
      lastSignature = signature();
      setOnline(true, 'Actualizado en vivo');
      softRefresh(cloud);
    }, (error) => {
      console.error(error);
      setOnline(false, navigator.onLine ? 'Error de sincronización' : 'Sin conexión');
    });
  }

  async function prepareUser(user) {
    currentUser = user;
    workspaceRef = db.collection('workspaces').doc(workspaceId);
    setGateLoading('Sesión encontrada. Sincronizando datos…');
    try {
      const data = await ensureWorkspace(user);
      await applyInitialCloud(data);
      syncReady = true;
      showApp(user);
      setOnline(true);
      watchWorkspace();
      setTimeout(() => softRefresh(data.state || {}), 0);
      setTimeout(() => softRefresh(data.state || {}), 300);
    } catch (error) {
      console.error('No se pudo preparar Firestore', error);
      syncReady = false;
      if (!navigator.onLine) showLoginForm('No hay conexión. Tu sesión sigue guardada; vuelve a intentar cuando tengas internet.');
      else showLoginForm(friendlyError(error));
    }
  }

  function bootDom() {
    const app = document.querySelector('main.app');
    if (app) app.hidden = true;
    buildGate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootDom, { once: true });
  else bootDom();

  auth.onAuthStateChanged(async (user) => {
    if (document.readyState === 'loading') {
      await new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    if (user) {
      await prepareUser(user);
      return;
    }
    currentUser = null;
    syncReady = false;
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = null;
    document.querySelector('#firebaseSession')?.remove();
    const app = document.querySelector('main.app');
    if (app) app.hidden = true;
    showLoginForm();
  });
})();