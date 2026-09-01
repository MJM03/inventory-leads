(() => {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyBEieYMJQwEilw7UylQFWJwVC2jMoL8rtw",
    authDomain: "inventory-leads.firebaseapp.com",
    projectId: "inventory-leads",
    storageBucket: "inventory-leads.firebasestorage.app",
    messagingSenderId: "295339658757",
    appId: "1:295339658757:web:241fa689a86bb92a32966c",
  };
  const workspaceId = "agp-inventory-leads";
  const syncedKeys = [
    "inventoryLeadOutreach",
    "inventoryLeadMessages",
    "inventoryLeadVariants",
    "inventoryLeadVariantResults",
    "inventoryLeadReplies",
    "inventoryLeadAccepted",
    "inventoryLeadGuidedSales",
    "inventoryLeadStrictFlow",
    "inventoryLeadQuoteData",
    "inventoryLeadHistory",
    "inventoryLeadSales",
    "agpPrintableQuote",
    "agpDailySalesPlan",
  ];
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const nativeGet = Storage.prototype.getItem;
  let currentUser = null;
  let workspaceRef = null;
  let unsubscribeWorkspace = null;
  let syncReady = false;
  let applyingCloud = false;
  let lastSignature = "";

  if (!window.firebase) {
    console.error("Firebase SDK no pudo cargarse.");
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(console.error);

  function parse(value, fallback = {}) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function localState() {
    return syncedKeys.reduce((state, key) => {
      state[key] = parse(nativeGet.call(localStorage, key));
      return state;
    }, {});
  }

  function signature(state = localState()) {
    return JSON.stringify(syncedKeys.map((key) => [key, state[key] || {}]));
  }

  function changedEntityIds(beforeValue, afterValue) {
    const before = parse(beforeValue);
    const after = parse(afterValue);
    const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...ids]
      .filter((id) => JSON.stringify(before[id]) !== JSON.stringify(after[id]))
      .slice(0, 25);
  }

  function friendlyError(error) {
    const messages = {
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/invalid-login-credentials": "Correo o contraseña incorrectos.",
      "auth/user-disabled": "Este usuario fue deshabilitado.",
      "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
      "auth/invalid-email": "Ingresa un correo válido.",
      "auth/missing-password": "Ingresa tu contraseña.",
      "auth/network-request-failed": "No se pudo conectar. Revisa tu internet.",
      "auth/user-not-found": "No existe un usuario con ese correo.",
    };
    return (
      messages[error?.code] ||
      "No se pudo iniciar sesión. Inténtalo nuevamente."
    );
  }

  function buildGate() {
    const gate = document.createElement("section");
    gate.id = "firebaseAuthGate";
    gate.className = "firebase-auth-gate";
    gate.innerHTML = `<div class="firebase-auth-card"><div class="firebase-auth-brand"><img src="agp-logo.jpg?v=105" alt="AGP"><div><h1>Inventory Leads</h1><p>Acceso seguro al CRM de AGP</p></div></div><form id="firebaseLoginForm" class="firebase-auth-form"><label>Correo electrónico<input id="firebaseEmail" type="email" autocomplete="username" required placeholder="usuario@correo.com"></label><label>Contraseña<input id="firebasePassword" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label><button id="firebaseLoginButton" class="firebase-auth-submit" type="submit">Ingresar</button><button id="firebaseResetButton" class="firebase-auth-link" type="button">Olvidé mi contraseña</button><p id="firebaseAuthMessage" class="firebase-auth-message" role="status"></p></form></div>`;
    document.body.appendChild(gate);
    const form = gate.querySelector("#firebaseLoginForm");
    const email = gate.querySelector("#firebaseEmail");
    const password = gate.querySelector("#firebasePassword");
    const message = gate.querySelector("#firebaseAuthMessage");
    const button = gate.querySelector("#firebaseLoginButton");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.className = "firebase-auth-message";
      message.textContent = "";
      button.disabled = true;
      button.textContent = "Ingresando…";
      try {
        await auth.signInWithEmailAndPassword(
          email.value.trim(),
          password.value,
        );
      } catch (error) {
        message.textContent = friendlyError(error);
        button.disabled = false;
        button.textContent = "Ingresar";
      }
    });
    gate
      .querySelector("#firebaseResetButton")
      .addEventListener("click", async () => {
        const address = email.value.trim();
        message.className = "firebase-auth-message";
        if (!address) {
          message.textContent = "Escribe primero tu correo electrónico.";
          return;
        }
        try {
          await auth.sendPasswordResetEmail(address);
          message.className = "firebase-auth-message ok";
          message.textContent =
            "Te enviamos un enlace para restablecer tu contraseña.";
        } catch (error) {
          message.textContent = friendlyError(error);
        }
      });
    return gate;
  }

  function showApp(user) {
    document.querySelector("#firebaseAuthGate")?.setAttribute("hidden", "");
    const app = document.querySelector("main.app");
    if (app) app.hidden = false;
    const actions = document.querySelector(".topactions");
    if (actions && !document.querySelector("#firebaseSession")) {
      const session = document.createElement("div");
      session.id = "firebaseSession";
      session.className = "firebase-session";
      session.innerHTML = `<span id="firebaseSyncDot" class="firebase-sync-dot" title="Sincronizando"></span><span class="firebase-session-copy"><b>${user.email || "Usuario"}</b><span id="firebaseSyncText">Sincronizando…</span></span><button class="firebase-signout" type="button">Salir</button>`;
      actions.prepend(session);
      session
        .querySelector(".firebase-signout")
        .addEventListener("click", async () => {
          syncReady = false;
          syncedKeys.forEach((key) => nativeRemove.call(localStorage, key));
          Object.keys(sessionStorage)
            .filter((key) => key.startsWith("firebaseReady:"))
            .forEach((key) => sessionStorage.removeItem(key));
          await auth.signOut();
        });
    }
  }

  function setOnline(ok, text = ok ? "Sincronizado" : "Sin conexión") {
    document.querySelector("#firebaseSyncDot")?.classList.toggle("online", ok);
    const label = document.querySelector("#firebaseSyncText");
    if (label) label.textContent = text;
  }

  async function writeCloud(key, value, beforeValue) {
    if (!syncReady || applyingCloud || !currentUser || !workspaceRef) return;
    const parsed = parse(value);
    const batch = db.batch();
    batch.set(
      workspaceRef,
      {
        state: { [key]: parsed },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || "" },
      },
      { merge: true },
    );
    changedEntityIds(beforeValue, value).forEach((entityId) => {
      const auditRef = workspaceRef.collection("audit").doc();
      batch.set(auditRef, {
        stateKey: key,
        entityId,
        action: Object.prototype.hasOwnProperty.call(parsed, entityId)
          ? "update"
          : "remove",
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    try {
      setOnline(false, "Guardando…");
      await batch.commit();
      lastSignature = signature();
      setOnline(true);
    } catch (error) {
      console.error("No se pudo sincronizar con Firestore", error);
      setOnline(false, "Error de sincronización");
    }
  }

  Storage.prototype.setItem = function (key, value) {
    const before = nativeGet.call(this, key);
    nativeSet.call(this, key, value);
    if (this === localStorage && syncedKeys.includes(key)) {
      lastSignature = signature();
      writeCloud(key, value, before);
    }
  };

  Storage.prototype.removeItem = function (key) {
    const before = nativeGet.call(this, key);
    nativeRemove.call(this, key);
    if (this === localStorage && syncedKeys.includes(key)) {
      lastSignature = signature();
      writeCloud(key, "{}", before);
    }
  };

  async function applyInitialCloud() {
    const snapshot = await workspaceRef.get();
    const cloud = snapshot.exists ? snapshot.data().state || {} : null;
    applyingCloud = true;
    if (cloud) {
      syncedKeys.forEach((key) =>
        nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})),
      );
    } else {
      await workspaceRef.set({
        name: "AGP Inventory Leads",
        state: localState(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: { uid: currentUser.uid, email: currentUser.email || "" },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || "" },
      });
    }
    applyingCloud = false;
    lastSignature = signature();
  }

  function watchWorkspace() {
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = workspaceRef.onSnapshot(
      (snapshot) => {
        if (
          !syncReady ||
          snapshot.metadata.hasPendingWrites ||
          !snapshot.exists
        )
          return;
        const cloud = snapshot.data().state || {};
        const cloudSignature = signature(cloud);
        if (cloudSignature === lastSignature) return;
        applyingCloud = true;
        syncedKeys.forEach((key) =>
          nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})),
        );
        applyingCloud = false;
        lastSignature = signature();
        setOnline(true, "Actualizado");
        window.setTimeout(() => window.location.reload(), 350);
      },
      (error) => {
        console.error(error);
        setOnline(false, "Sin conexión");
      },
    );
  }

  async function prepareUser(user) {
    currentUser = user;
    workspaceRef = db.collection("workspaces").doc(workspaceId);
    const sessionKey = `firebaseReady:${user.uid}`;
    try {
      await applyInitialCloud();
      if (sessionStorage.getItem(sessionKey) !== "1") {
        sessionStorage.setItem(sessionKey, "1");
        window.location.reload();
        return;
      }
      syncReady = true;
      showApp(user);
      setOnline(true);
      watchWorkspace();
    } catch (error) {
      console.error("No se pudo preparar Firestore", error);
      const message = document.querySelector("#firebaseAuthMessage");
      if (message)
        message.textContent =
          "Tu sesión abrió, pero Firestore todavía no permite el acceso.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("main.app");
    if (app) app.hidden = true;
    buildGate();
  });

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (document.readyState === "loading")
        await new Promise((resolve) =>
          document.addEventListener("DOMContentLoaded", resolve, {
            once: true,
          }),
        );
      await prepareUser(user);
      return;
    }
    currentUser = null;
    syncReady = false;
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = null;
    const app = document.querySelector("main.app");
    if (app) app.hidden = true;
    document.querySelector("#firebaseAuthGate")?.removeAttribute("hidden");
    document.querySelector("#firebaseSession")?.remove();
  });
})();
