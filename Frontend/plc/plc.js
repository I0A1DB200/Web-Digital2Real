// Frontend/plc/plc.js
(function () {
  const TYPES = ["BOOL", "INT", "DINT", "REAL", "STRING[20]"];
  const DIRS  = ["IN", "OUT"];

  const state = {
    mode: "simple", // "simple" | "tech"
    projectName: "D2R_Project",
    fbName: "FB_Main",
    udtName: "UDT_IO",
    dbName: "DB_IO",
    io: [
      { name: "Start", type: "BOOL", dir: "IN",  comment: "Orden de arranque" },
      { name: "Stop",  type: "BOOL", dir: "IN",  comment: "Orden de paro" },
      { name: "Reset", type: "BOOL", dir: "IN",  comment: "Reset de fallo" },
      { name: "Run",   type: "BOOL", dir: "OUT", comment: "Estado marcha" },
      { name: "Fault", type: "BOOL", dir: "OUT", comment: "Fallo activo" },
      { name: "Rpm",   type: "REAL", dir: "OUT", comment: "Velocidad real (rpm)" },
    ],
  };

  // ---------- helpers ----------
  function sanitizeIdent(raw) {
    // Identificador simple estilo Siemens: letras, números y _
    const s = String(raw || "").trim();
    const out = s
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .replace(/^(\d)/, "_$1");
    return out || "Var";
  }

  function escComment(s) {
    return String(s || "").replace(/\r?\n/g, " ").trim();
  }

  function ts() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }, 0);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  // ---------- SCL generators ----------
  function genHeaderBlock() {
    return [
      `// Digital2Real · PLC Creator`,
      `// Target: Siemens TIA Portal (SCL)`,
      `// Generated: ${ts()}`,
      `// Project: ${state.projectName}`,
      ``,
    ].join("\n");
  }

  function genVarSections() {
    const ins = state.io.filter(x => x.dir === "IN");
    const outs = state.io.filter(x => x.dir === "OUT");

    const toLine = (x) => {
      const n = sanitizeIdent(x.name);
      const t = x.type || "BOOL";
      const c = escComment(x.comment);
      return c ? `    ${n} : ${t}; // ${c}` : `    ${n} : ${t};`;
    };

    const lines = [];

    if (ins.length) {
      lines.push(`VAR_INPUT`);
      ins.forEach(x => lines.push(toLine(x)));
      lines.push(`END_VAR`, ``);
    } else {
      lines.push(`// VAR_INPUT (none)`, ``);
    }

    if (outs.length) {
      lines.push(`VAR_OUTPUT`);
      outs.forEach(x => lines.push(toLine(x)));
      lines.push(`END_VAR`, ``);
    } else {
      lines.push(`// VAR_OUTPUT (none)`, ``);
    }

    return lines.join("\n");
  }

  function genSimpleSCL() {
    const fb = sanitizeIdent(state.fbName);

    return [
      genHeaderBlock(),
      `FUNCTION_BLOCK ${fb}`,
      `// --- Auto-generated template (Simple mode) ---`,
      ``,
      genVarSections(),
      `BEGIN`,
      `    // TODO: implement logic`,
      `    // Example:`,
      `    // IF Start THEN Run := TRUE; END_IF;`,
      `END_FUNCTION_BLOCK`,
      ``,
    ].join("\n");
  }

  function genTechSCL() {
    // Plantilla avanzada (UDT + DB + FB)
    const fb = sanitizeIdent(state.fbName);
    const udt = sanitizeIdent(state.udtName);
    const db = sanitizeIdent(state.dbName);

    const fields = state.io.map(x => {
      const n = sanitizeIdent(x.name);
      const t = x.type || "BOOL";
      const c = escComment(x.comment);
      return c ? `    ${n} : ${t}; // ${c}` : `    ${n} : ${t};`;
    });

    return [
      genHeaderBlock(),
      `// ============================================`,
      `// TECH MODE TEMPLATE`,
      `// - TYPE ${udt}`,
      `// - DATA_BLOCK ${db}`,
      `// - FUNCTION_BLOCK ${fb}`,
      `// ============================================`,
      ``,
      `TYPE ${udt} : STRUCT`,
      ...fields,
      `END_STRUCT;`,
      `END_TYPE`,
      ``,
      `DATA_BLOCK ${db}`,
      `// Holds IO/state in a single structure`,
      `VAR`,
      `    IO : ${udt};`,
      `END_VAR`,
      `BEGIN`,
      `    // Optional: initialize values here`,
      `END_DATA_BLOCK`,
      ``,
      `FUNCTION_BLOCK ${fb}`,
      `// --- Auto-generated template (Technical mode) ---`,
      ``,
      genVarSections(),
      `VAR`,
      `    // Internal variables`,
      `    State : INT := 0;`,
      `END_VAR`,
      ``,
      `BEGIN`,
      `    // Suggested structure:`,
      `    // CASE State OF`,
      `    //   0: // READY`,
      `    //   1: // RUNNING`,
      `    //   2: // FAULT`,
      `    // END_CASE;`,
      `END_FUNCTION_BLOCK`,
      ``,
    ].join("\n");
  }

  function generate() {
    // normaliza nombres base
    state.projectName = String(document.getElementById("projName").value || "").trim() || "D2R_Project";
    state.fbName = String(document.getElementById("fbName").value || "").trim() || "FB_Main";
    state.udtName = String(document.getElementById("udtName").value || "").trim() || "UDT_IO";
    state.dbName = String(document.getElementById("dbName").value || "").trim() || "DB_IO";

    // validación mínima IO
    state.io = state.io
      .map(x => ({
        name: sanitizeIdent(x.name),
        type: x.type || "BOOL",
        dir: (x.dir === "OUT" ? "OUT" : "IN"),
        comment: escComment(x.comment),
      }))
      .filter(x => x.name.length > 0);

    const text = (state.mode === "tech") ? genTechSCL() : genSimpleSCL();
    return text;
  }

  // ---------- UI ----------
  const els = {
    modeSimple: document.getElementById("modeSimple"),
    modeTech: document.getElementById("modeTech"),
    techBlock: document.getElementById("techBlock"),

    projName: document.getElementById("projName"),
    fbName: document.getElementById("fbName"),
    udtName: document.getElementById("udtName"),
    dbName: document.getElementById("dbName"),

    ioTbody: document.getElementById("ioTbody"),

    btnAddRow: document.getElementById("btnAddRow"),
    btnResetDemo: document.getElementById("btnResetDemo"),
    btnGenerate: document.getElementById("btnGenerate"),
    btnCopy: document.getElementById("btnCopy"),
    btnDownload: document.getElementById("btnDownload"),

    outText: document.getElementById("outText"),
    outMeta: document.getElementById("outMeta"),
    outStatus: document.getElementById("outStatus"),
  };

  function setMode(mode) {
    state.mode = mode;

    const isTech = (mode === "tech");
    els.modeSimple.classList.toggle("is-active", !isTech);
    els.modeTech.classList.toggle("is-active", isTech);

    els.modeSimple.setAttribute("aria-selected", String(!isTech));
    els.modeTech.setAttribute("aria-selected", String(isTech));

    els.techBlock.hidden = !isTech;

    // meta
    els.outMeta.textContent = isTech ? "Modo: Técnico · Output: UDT + DB + FB" : "Modo: Simple · Output: FB";
  }

  function renderTable() {
    els.ioTbody.innerHTML = "";

    state.io.forEach((row, idx) => {
      const tr = document.createElement("tr");

      // nombre
      const tdName = document.createElement("td");
      const inName = document.createElement("input");
      inName.className = "cell-input";
      inName.value = row.name;
      inName.addEventListener("input", () => { row.name = inName.value; });
      tdName.appendChild(inName);

      // tipo
      const tdType = document.createElement("td");
      const selType = document.createElement("select");
      selType.className = "cell-select";
      TYPES.forEach(t => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t;
        if (row.type === t) o.selected = true;
        selType.appendChild(o);
      });
      selType.addEventListener("change", () => { row.type = selType.value; });
      tdType.appendChild(selType);

      // dir
      const tdDir = document.createElement("td");
      const selDir = document.createElement("select");
      selDir.className = "cell-select";
      DIRS.forEach(d => {
        const o = document.createElement("option");
        o.value = d;
        o.textContent = (d === "IN" ? "IN (VAR_INPUT)" : "OUT (VAR_OUTPUT)");
        if (row.dir === d) o.selected = true;
        selDir.appendChild(o);
      });
      selDir.addEventListener("change", () => { row.dir = selDir.value; });
      tdDir.appendChild(selDir);

      // comment
      const tdC = document.createElement("td");
      const inC = document.createElement("input");
      inC.className = "cell-input";
      inC.value = row.comment || "";
      inC.placeholder = "Comentario (opcional)";
      inC.addEventListener("input", () => { row.comment = inC.value; });
      tdC.appendChild(inC);

      // delete
      const tdDel = document.createElement("td");
      const btnDel = document.createElement("button");
      btnDel.className = "row-btn";
      btnDel.type = "button";
      btnDel.textContent = "Eliminar";
      btnDel.addEventListener("click", () => {
        state.io.splice(idx, 1);
        renderTable();
      });
      tdDel.appendChild(btnDel);

      tr.appendChild(tdName);
      tr.appendChild(tdType);
      tr.appendChild(tdDir);
      tr.appendChild(tdC);
      tr.appendChild(tdDel);

      els.ioTbody.appendChild(tr);
    });
  }

  function loadDemo() {
    state.projectName = "D2R_Project";
    state.fbName = "FB_Main";
    state.udtName = "UDT_IO";
    state.dbName = "DB_IO";
    state.io = [
      { name: "Start", type: "BOOL", dir: "IN", comment: "Orden de arranque" },
      { name: "Stop", type: "BOOL", dir: "IN", comment: "Orden de paro" },
      { name: "Reset", type: "BOOL", dir: "IN", comment: "Reset de fallo" },
      { name: "AutoMode", type: "BOOL", dir: "IN", comment: "Modo automático" },
      { name: "Run", type: "BOOL", dir: "OUT", comment: "Estado marcha" },
      { name: "Fault", type: "BOOL", dir: "OUT", comment: "Fallo activo" },
      { name: "RpmSetpoint", type: "REAL", dir: "IN", comment: "Setpoint velocidad (rpm)" },
      { name: "RpmActual", type: "REAL", dir: "OUT", comment: "Velocidad real (rpm)" },
    ];

    els.projName.value = state.projectName;
    els.fbName.value = state.fbName;
    els.udtName.value = state.udtName;
    els.dbName.value = state.dbName;

    renderTable();
    els.outStatus.textContent = "Ejemplo cargado.";
  }

  // events
  els.modeSimple.addEventListener("click", () => setMode("simple"));
  els.modeTech.addEventListener("click", () => setMode("tech"));

  els.btnAddRow.addEventListener("click", () => {
    state.io.push({ name: "Signal", type: "BOOL", dir: "IN", comment: "" });
    renderTable();
  });

  els.btnResetDemo.addEventListener("click", loadDemo);

  els.btnGenerate.addEventListener("click", () => {
    const out = generate();
    els.outText.value = out;
    els.outStatus.textContent = "SCL generado.";
  });

  els.btnCopy.addEventListener("click", async () => {
    const text = els.outText.value || "";
    if (!text.trim()) {
      els.outStatus.textContent = "Nada que copiar. Genera primero el SCL.";
      return;
    }
    const ok = await copyToClipboard(text);
    els.outStatus.textContent = ok ? "Copiado al portapapeles." : "No se pudo copiar (permiso del navegador).";
  });

  els.btnDownload.addEventListener("click", () => {
    const text = els.outText.value || "";
    if (!text.trim()) {
      els.outStatus.textContent = "Nada que descargar. Genera primero el SCL.";
      return;
    }
    const fb = sanitizeIdent(els.fbName.value || "FB_Main");
    const fname = `${fb}.scl`;
    downloadText(fname, text);
    els.outStatus.textContent = `Descargado: ${fname}`;
  });

  // init
  els.projName.value = state.projectName;
  els.fbName.value = state.fbName;
  els.udtName.value = state.udtName;
  els.dbName.value = state.dbName;

  setMode("simple");
  renderTable();
  els.outText.value = generate(); // genera un primer output
})();
