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
  const VERSION = "10.6";
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
    "inventoryLeadAssignments",
    "agpPrintableQuote",
    "agpDailySalesPlan",
  ];
  const roles = {
    admin: "Administrador",
    supervisor: "Supervisor",
    vendedor: "Vendedor",
  };
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const nativeGet = Storage.prototype.getItem;
  let currentUser = null;
  let currentMember = null;
  let workspaceRef = null;
  let unsubscribeWorkspace = null;
  let syncReady = false;
  let applyingCloud = false;
  let lastSignature = "";
  let lastWorkspaceData = null;

  if (!window.firebase) {
    console.error("Firebase SDK no pudo cargarse.");
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

  function parse(value, fallback = {}) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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
      "permission-denied": "Tu usuario no tiene permiso para realizar esta acción.",
    };
    return messages[error?.code] || "No se pudo completar la operación.";
  }

  function buildGate() {
    if (document.querySelector("#firebaseAuthGate")) return;
    const gate = document.createElement("section");
    gate.id = "firebaseAuthGate";
    gate.className = "firebase-auth-gate";
    gate.innerHTML = `<div class="firebase-auth-card"><div class="firebase-auth-brand"><img alt="AGP"><div><h1>Inventory Leads</h1><p>Acceso seguro al CRM de AGP</p></div></div><form id="firebaseLoginForm" class="firebase-auth-form"><label>Correo electrónico<input id="firebaseEmail" type="email" autocomplete="username" required placeholder="usuario@correo.com"></label><label>Contraseña<input id="firebasePassword" type="password" autocomplete="current-password" required placeholder="Tu contraseña"></label><button id="firebaseLoginButton" class="firebase-auth-submit" type="submit">Ingresar</button><button id="firebaseResetButton" class="firebase-auth-link" type="button">Olvidé mi contraseña</button><p id="firebaseAuthMessage" class="firebase-auth-message" role="status"></p></form></div>`;
    gate.querySelector(".firebase-auth-brand img").src = window.AGP_LOGO || "agp-logo.jpg";
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
        await auth.signInWithEmailAndPassword(email.value.trim(), password.value);
      } catch (error) {
        message.textContent = friendlyError(error);
        button.disabled = false;
        button.textContent = "Ingresar";
      }
    });
    gate.querySelector("#firebaseResetButton").addEventListener("click", async () => {
      const address = email.value.trim();
      message.className = "firebase-auth-message";
      if (!address) {
        message.textContent = "Escribe primero tu correo electrónico.";
        return;
      }
      try {
        await auth.sendPasswordResetEmail(address);
        message.className = "firebase-auth-message ok";
        message.textContent = "Te enviamos un enlace para restablecer tu contraseña.";
      } catch (error) {
        message.textContent = friendlyError(error);
      }
    });
  }

  function setGateMessage(text) {
    const message = document.querySelector("#firebaseAuthMessage");
    if (message) message.textContent = text;
  }

  function memberFor(data, uid) {
    const member = data?.members?.[uid];
    return member && member.active !== false ? member : null;
  }

  async function ensureWorkspaceAndMembership(user) {
    let snapshot = await workspaceRef.get();
    if (!snapshot.exists) {
      const initialMember = {
        email: user.email || "",
        role: "admin",
        active: true,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
        addedBy: user.uid,
      };
      await workspaceRef.set({
        name: "AGP Inventory Leads",
        version: VERSION,
        ownerUid: user.uid,
        members: { [user.uid]: initialMember },
        state: localState(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: { uid: user.uid, email: user.email || "" },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: user.uid, email: user.email || "" },
      });
      snapshot = await workspaceRef.get();
    }
    let data = snapshot.data() || {};
    const noMembers = !data.members || !Object.keys(data.members).length;
    if (noMembers && !data.ownerUid) {
      await workspaceRef.set(
        {
          version: VERSION,
          ownerUid: user.uid,
          members: {
            [user.uid]: {
              email: user.email || "",
              role: "admin",
              active: true,
              addedAt: firebase.firestore.FieldValue.serverTimestamp(),
              addedBy: user.uid,
            },
          },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: { uid: user.uid, email: user.email || "" },
        },
        { merge: true },
      );
      snapshot = await workspaceRef.get();
      data = snapshot.data() || {};
    }
    const member = memberFor(data, user.uid);
    if (!member) throw Object.assign(new Error("not-authorized"), { code: "not-authorized" });
    lastWorkspaceData = data;
    currentMember = member;
    return data;
  }

  function canManageTeam() {
    return currentMember?.role === "admin";
  }

  function canAssign() {
    return ["admin", "supervisor"].includes(currentMember?.role);
  }

  function setOnline(ok, text = ok ? "Sincronizado" : "Sin conexión") {
    document.querySelector("#firebaseSyncDot")?.classList.toggle("online", ok);
    const label = document.querySelector("#firebaseSyncText");
    if (label) label.textContent = text;
  }

  function addVersionToHistory() {
    const list = document.querySelector("#updates .updates");
    if (!list || list.querySelector('[data-version="10.6"]')) return;
    const item = document.createElement("div");
    item.className = "update";
    item.dataset.version = "10.6";
    item.innerHTML = `<div class="date">31 AGO 2026 · V10.6</div><b>Equipo, roles y asignación multiusuario</b><p>Se agregaron miembros autorizados, roles Administrador/Supervisor/Vendedor, asignación de prospectos, permisos reforzados y actualización remota sin recargar toda la página.</p>`;
    list.prepend(item);
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
      session.innerHTML = `<button class="firebase-team" type="button" title="Equipo"><span id="firebaseSyncDot" class="firebase-sync-dot" title="Sincronizando"></span><span class="firebase-session-copy"><b>${escapeHtml(user.email || "Usuario")}</b><span id="firebaseSyncText">Sincronizando…</span></span><span class="firebase-role">${escapeHtml(roles[currentMember?.role] || currentMember?.role || "Usuario")}</span></button><button class="firebase-signout" type="button">Salir</button>`;
      actions.prepend(session);
      session.querySelector(".firebase-team").addEventListener("click", openTeamPanel);
      session.querySelector(".firebase-signout").addEventListener("click", async () => {
        syncReady = false;
        syncedKeys.forEach((key) => nativeRemove.call(localStorage, key));
        Object.keys(sessionStorage)
          .filter((key) => key.startsWith("firebaseReady:"))
          .forEach((key) => sessionStorage.removeItem(key));
        await auth.signOut();
      });
    }
    addVersionToHistory();
  }

  function teamRows(data) {
    const assignments = parse(nativeGet.call(localStorage, "inventoryLeadAssignments"));
    const counts = Object.values(assignments).reduce((acc, item) => {
      if (item?.userId) acc[item.userId] = (acc[item.userId] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(data?.members || {})
      .sort(([, a], [, b]) => (a.email || "").localeCompare(b.email || ""))
      .map(([uid, member]) => `<div class="firebase-member ${member.active === false ? "off" : ""}"><div><b>${escapeHtml(member.email || uid)}</b><span>${escapeHtml(roles[member.role] || member.role || "Usuario")} · ${counts[uid] || 0} asignados</span><small>${escapeHtml(uid)}</small></div>${canManageTeam() && uid !== currentUser?.uid ? `<button type="button" data-member-toggle="${escapeHtml(uid)}">${member.active === false ? "Activar" : "Desactivar"}</button>` : ""}</div>`)
      .join("");
  }

  function openTeamPanel() {
    document.querySelector("#firebaseTeamDialog")?.remove();
    const dialog = document.createElement("dialog");
    dialog.id = "firebaseTeamDialog";
    dialog.className = "firebase-team-dialog";
    dialog.innerHTML = `<div class="firebase-team-sheet"><div class="firebase-team-head"><div><span class="miniLabel">V10.6 Multiusuario</span><h2>Equipo AGP</h2><p>Usuarios autorizados para trabajar con Inventory Leads.</p></div><button type="button" class="firebase-team-close" aria-label="Cerrar">×</button></div><div id="firebaseMemberList" class="firebase-member-list">${teamRows(lastWorkspaceData)}</div>${canManageTeam() ? `<form id="firebaseMemberForm" class="firebase-member-form"><h3>Autorizar usuario</h3><p>Crea primero la cuenta en Firebase Authentication y pega aquí su UID.</p><label>UID<input id="firebaseMemberUid" required autocomplete="off" placeholder="UID de Firebase Authentication"></label><label>Correo<input id="firebaseMemberEmail" type="email" required placeholder="usuario@correo.com"></label><label>Rol<select id="firebaseMemberRole"><option value="vendedor">Vendedor</option><option value="supervisor">Supervisor</option><option value="admin">Administrador</option></select></label><button class="firebase-auth-submit" type="submit">Autorizar acceso</button><p id="firebaseTeamMessage" class="firebase-auth-message" role="status"></p></form>` : `<div class="firebase-role-note">Tu rol actual es <b>${escapeHtml(roles[currentMember?.role] || currentMember?.role)}</b>. Solo un Administrador puede autorizar o desactivar usuarios.</div>`}</div>`;
    document.body.appendChild(dialog);
    dialog.querySelector(".firebase-team-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
      const button = event.target.closest?.("[data-member-toggle]");
      if (button) toggleMember(button.dataset.memberToggle);
    });
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.querySelector("#firebaseMemberForm")?.addEventListener("submit", addMember);
    dialog.showModal();
  }

  async function addMember(event) {
    event.preventDefault();
    if (!canManageTeam()) return;
    const uid = event.currentTarget.querySelector("#firebaseMemberUid").value.trim();
    const email = event.currentTarget.querySelector("#firebaseMemberEmail").value.trim().toLowerCase();
    const role = event.currentTarget.querySelector("#firebaseMemberRole").value;
    const message = event.currentTarget.querySelector("#firebaseTeamMessage");
    if (!uid || !email || !roles[role]) return;
    try {
      await workspaceRef.update({
        [`members.${uid}`]: {
          email,
          role,
          active: true,
          addedAt: firebase.firestore.FieldValue.serverTimestamp(),
          addedBy: currentUser.uid,
        },
        version: VERSION,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || "" },
      });
      message.className = "firebase-auth-message ok";
      message.textContent = "Usuario autorizado.";
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      message.textContent = friendlyError(error);
    }
  }

  async function toggleMember(uid) {
    if (!canManageTeam() || !uid || uid === currentUser?.uid) return;
    const existing = lastWorkspaceData?.members?.[uid];
    if (!existing) return;
    try {
      await workspaceRef.update({
        [`members.${uid}.active`]: existing.active === false,
        [`members.${uid}.updatedAt`]: firebase.firestore.FieldValue.serverTimestamp(),
        [`members.${uid}.updatedBy`]: currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || "" },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function writeCloud(key, value, beforeValue) {
    if (!syncReady || applyingCloud || !currentUser || !workspaceRef) return;
    if (key === "inventoryLeadAssignments" && !canAssign()) {
      applyingCloud = true;
      nativeSet.call(localStorage, key, beforeValue || "{}");
      applyingCloud = false;
      return;
    }
    const parsed = parse(value);
    const batch = db.batch();
    batch.set(
      workspaceRef,
      {
        state: { [key]: parsed },
        version: VERSION,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: { uid: currentUser.uid, email: currentUser.email || "", role: currentMember?.role || "" },
      },
      { merge: true },
    );
    changedEntityIds(beforeValue, value).forEach((entityId) => {
      const auditRef = workspaceRef.collection("audit").doc();
      batch.set(auditRef, {
        stateKey: key,
        entityId,
        action: Object.prototype.hasOwnProperty.call(parsed, entityId) ? "update" : "remove",
        userId: currentUser.uid,
        userEmail: currentUser.email || "",
        userRole: currentMember?.role || "",
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

  async function applyInitialCloud(data) {
    const cloud = data?.state || null;
    applyingCloud = true;
    if (cloud) {
      syncedKeys.forEach((key) => nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})));
    } else {
      await workspaceRef.set(
        {
          state: localState(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: { uid: currentUser.uid, email: currentUser.email || "" },
        },
        { merge: true },
      );
    }
    applyingCloud = false;
    lastSignature = signature();
  }

  function syncMutableObject(target, source) {
    if (!target || typeof target !== "object") return;
    Object.keys(target).forEach((key) => delete target[key]);
    Object.assign(target, source || {});
  }

  function softRefresh(cloud) {
    try {
      if (typeof saved !== "undefined") syncMutableObject(saved, cloud.inventoryLeadOutreach);
      if (typeof custom !== "undefined") syncMutableObject(custom, cloud.inventoryLeadMessages);
      if (typeof variants !== "undefined") syncMutableObject(variants, cloud.inventoryLeadVariants);
      if (typeof results !== "undefined") syncMutableObject(results, cloud.inventoryLeadVariantResults);
      if (typeof replies !== "undefined") syncMutableObject(replies, cloud.inventoryLeadReplies);
      if (typeof accepted !== "undefined") syncMutableObject(accepted, cloud.inventoryLeadAccepted);
      if (typeof leads !== "undefined") {
        const outreach = cloud.inventoryLeadOutreach || {};
        leads.forEach((lead) => { lead.outreach = outreach[lead.id] || "Sin contactar"; });
      }
      if (typeof drawStats === "function") drawStats();
      if (typeof render === "function") render();
      if (typeof renderAccepted === "function") renderAccepted();
      window.AGP_PENDING?.updateBadge?.();
      window.dispatchEvent(new CustomEvent("agp:firebase-sync", { detail: { remote: true } }));
    } catch (error) {
      console.warn("La actualización remota requerirá recarga manual", error);
      setOnline(true, "Actualizado · recarga si falta algo");
    }
  }

  function watchWorkspace() {
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = workspaceRef.onSnapshot(
      (snapshot) => {
        if (!snapshot.exists) return;
        const data = snapshot.data() || {};
        lastWorkspaceData = data;
        const member = memberFor(data, currentUser?.uid);
        if (!member) {
          syncReady = false;
          setGateMessage("Tu acceso a este CRM fue desactivado.");
          auth.signOut();
          return;
        }
        currentMember = member;
        const roleNode = document.querySelector(".firebase-role");
        if (roleNode) roleNode.textContent = roles[currentMember.role] || currentMember.role || "Usuario";
        const memberList = document.querySelector("#firebaseMemberList");
        if (memberList) memberList.innerHTML = teamRows(data);
        if (!syncReady || snapshot.metadata.hasPendingWrites) return;
        const cloud = data.state || {};
        const cloudSignature = signature(cloud);
        if (cloudSignature === lastSignature) return;
        applyingCloud = true;
        syncedKeys.forEach((key) => nativeSet.call(localStorage, key, JSON.stringify(cloud[key] || {})));
        applyingCloud = false;
        lastSignature = signature();
        setOnline(true, "Actualizado en vivo");
        softRefresh(cloud);
      },
      (error) => {
        console.error(error);
        setOnline(false, "Sin conexión");
      },
    );
  }

  function decorateLeadAssignment(id) {
    const modal = document.querySelector("#modal");
    if (!modal || modal.querySelector(".firebase-assignment")) return;
    const members = Object.entries(lastWorkspaceData?.members || {}).filter(([, m]) => m.active !== false);
    const assignments = parse(nativeGet.call(localStorage, "inventoryLeadAssignments"));
    const current = assignments[id] || {};
    const box = document.createElement("div");
    box.className = "block firebase-assignment";
    const options = members.map(([uid, m]) => `<option value="${escapeHtml(uid)}" ${current.userId === uid ? "selected" : ""}>${escapeHtml(m.email || uid)} · ${escapeHtml(roles[m.role] || m.role)}</option>`).join("");
    box.innerHTML = `<h3>Responsable</h3>${canAssign() ? `<select class="ctl firebase-assignee"><option value="">Sin asignar</option>${options}</select><div class="responseHelp">Administrador y Supervisor pueden reasignar este prospecto.</div>` : `<div class="contact">${escapeHtml(current.email || "Sin asignar")}</div>`}`;
    modal.appendChild(box);
    box.querySelector(".firebase-assignee")?.addEventListener("change", (event) => {
      const userId = event.target.value;
      const selected = lastWorkspaceData?.members?.[userId];
      const next = parse(nativeGet.call(localStorage, "inventoryLeadAssignments"));
      if (!userId) delete next[id];
      else next[id] = {
        userId,
        email: selected?.email || "",
        assignedAt: new Date().toISOString(),
        assignedBy: currentUser.uid,
      };
      localStorage.setItem("inventoryLeadAssignments", JSON.stringify(next));
    });
  }

  function installLeadAssignmentHook() {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (typeof window.openLead === "function" && !window.openLead.__firebase106) {
        clearInterval(timer);
        const original = window.openLead;
        const wrapped = function (id) {
          const result = original.apply(this, arguments);
          queueMicrotask(() => decorateLeadAssignment(id));
          return result;
        };
        wrapped.__firebase106 = true;
        window.openLead = wrapped;
      } else if (attempts > 50) clearInterval(timer);
    }, 100);
  }

  async function prepareUser(user) {
    currentUser = user;
    workspaceRef = db.collection("workspaces").doc(workspaceId);
    const sessionKey = `firebaseReady106:${user.uid}`;
    try {
      const data = await ensureWorkspaceAndMembership(user);
      await applyInitialCloud(data);
      if (sessionStorage.getItem(sessionKey) !== "1") {
        sessionStorage.setItem(sessionKey, "1");
        window.location.reload();
        return;
      }
      syncReady = true;
      showApp(user);
      setOnline(true);
      watchWorkspace();
      installLeadAssignmentHook();
    } catch (error) {
      console.error("No se pudo preparar Firestore", error);
      if (error?.code === "not-authorized") {
        setGateMessage("Tu cuenta existe, pero todavía no está autorizada para AGP Inventory Leads.");
      } else {
        setGateMessage("Tu sesión abrió, pero Firestore todavía no permite el acceso.");
      }
      await auth.signOut().catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("main.app");
    if (app) app.hidden = true;
    buildGate();
  });

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      if (document.readyState === "loading") {
        await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve, { once: true }));
      }
      await prepareUser(user);
      return;
    }
    currentUser = null;
    currentMember = null;
    syncReady = false;
    unsubscribeWorkspace?.();
    unsubscribeWorkspace = null;
    const app = document.querySelector("main.app");
    if (app) app.hidden = true;
    document.querySelector("#firebaseAuthGate")?.removeAttribute("hidden");
    document.querySelector("#firebaseSession")?.remove();
  });
})();
