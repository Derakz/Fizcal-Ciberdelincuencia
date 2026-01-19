/**************************************
 * CONFIGURACIÓN GENERAL
 **************************************/
const OPENAI_MODEL = "gpt-4.1-mini";

/**************************************
 * DISPOSICIONES
 **************************************/
const DISPOSICIONES = {
  fraude: {
    label: "Fraude Informático",
    disposiciones: [
      {
        id: "apertura_fraude",
        label: "Disposición de Apertura",
        template: "plantilla_apertura_fraude.docx"
      },
      {
        id: "archivo_monto",
        label: "Archivo Liminar – Monto Mínimo",
        template: "plantilla_archivo_monto_minimo.docx"
      }
    ]
  },
  suplantacion: {
    label: "Suplantación de Identidad",
    disposiciones: [
      {
        id: "apertura_suplantacion",
        label: "Disposición de Apertura",
        template: "plantilla_apertura_suplantacion.docx"
      }
    ]
  }
};

/**************************************
 * DESPACHOS FISCALES
 **************************************/
const DESPACHOS = {
  pfcc_1_1: { label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho", texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho" },
  pfcc_1_2: { label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho", texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho" },
  pfcc_1_3: { label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho", texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho" },
  pfcc_1_4: { label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho", texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho" },
  pfcc_1_5: { label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho", texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho" },
  pfcc_2_1: { label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho", texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho" },
  pfcc_2_2: { label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho", texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho" },
  pfcc_2_3: { label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho", texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho" },
  pfcc_2_4: { label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho", texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho" },
  pfcc_2_5: { label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho", texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho" }
};

/**************************************
 * ELEMENTOS DOM
 **************************************/
const caseInput = document.getElementById("caseInput");
const pdfInput = document.getElementById("pdfInput");
const datosApoyoInput = document.getElementById("datosApoyo");
const estado = document.getElementById("estado");

const btnTextoManual = document.getElementById("btnTextoManual");
const btnGenerar = document.getElementById("btnGenerar");
const toggleTheme = document.getElementById("toggleTheme");

const delitoSelect = document.getElementById("delitoSelect");
const disposicionSelect = document.getElementById("disposicionSelect");
const despachoSelect = document.getElementById("despachoSelect");

const fiscalInput = document.getElementById("fiscalInput");
const rememberFiscalCheckbox = document.getElementById("rememberFiscal");
const chkRecordarDespacho = document.getElementById("chkRecordarDespacho");

/**************************************
 * MOSTRAR / OCULTAR TEXTO MANUAL
 **************************************/
btnTextoManual.onclick = () => caseInput.classList.toggle("hidden");

/**************************************
 * DARK MODE
 **************************************/
toggleTheme.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

/**************************************
 * UTILIDADES
 **************************************/
function aFormatoTitulo(texto) {
  return texto
    ? texto.toLowerCase().split(" ").filter(p => p).map(p => p[0].toUpperCase() + p.slice(1)).join(" ")
    : "";
}

function fechaLargaPeru(fecha = new Date()) {
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/**************************************
 * RECORDAR DESPACHO
 **************************************/
Object.entries(DESPACHOS).forEach(([key, val]) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = val.label;
  despachoSelect.appendChild(opt);
});

if (localStorage.getItem("recordarDespacho") === "true") {
  const guardado = localStorage.getItem("despachoFiscal");
  if (guardado && DESPACHOS[guardado]) {
    despachoSelect.value = guardado;
    chkRecordarDespacho.checked = true;
  }
}

despachoSelect.addEventListener("change", () => {
  if (chkRecordarDespacho.checked) {
    localStorage.setItem("despachoFiscal", despachoSelect.value);
  }
});

chkRecordarDespacho.addEventListener("change", () => {
  if (chkRecordarDespacho.checked) {
    localStorage.setItem("recordarDespacho", "true");
    localStorage.setItem("despachoFiscal", despachoSelect.value);
  } else {
    localStorage.removeItem("recordarDespacho");
    localStorage.removeItem("despachoFiscal");
  }
});

/**************************************
 * RECORDAR FISCAL RESPONSABLE
 **************************************/
const fiscalGuardado = localStorage.getItem("fiscal_responsable");

if (fiscalGuardado) {
  fiscalInput.value = fiscalGuardado;
  rememberFiscalCheckbox.checked = true;
}

rememberFiscalCheckbox.addEventListener("change", () => {
  if (rememberFiscalCheckbox.checked) {
    if (!fiscalInput.value.trim()) {
      alert("Ingrese el fiscal antes de recordarlo.");
      rememberFiscalCheckbox.checked = false;
      return;
    }
    localStorage.setItem("fiscal_responsable", fiscalInput.value.trim());
  } else {
    localStorage.removeItem("fiscal_responsable");
  }
});

fiscalInput.addEventListener("input", () => {
  if (rememberFiscalCheckbox.checked) {
    localStorage.setItem("fiscal_responsable", fiscalInput.value.trim());
  }
});

/**************************************
 * DISPOSICIONES
 **************************************/
Object.entries(DISPOSICIONES).forEach(([key, val]) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = val.label;
  delitoSelect.appendChild(opt);
});

delitoSelect.onchange = () => {
  disposicionSelect.innerHTML = '<option value="">Seleccione disposición</option>';
  const delito = delitoSelect.value;
  if (!delito) return;

  DISPOSICIONES[delito].disposiciones.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.label;
    disposicionSelect.appendChild(opt);
  });
};

function obtenerDisposicionSeleccionada() {
  return DISPOSICIONES[delitoSelect.value]?.disposiciones.find(d => d.id === disposicionSelect.value) || null;
}

/**************************************
 * GENERAR WORD
 **************************************/
async function generarWord(datos, template, nombre) {
  const res = await fetch(template);
  const content = await res.arrayBuffer();
  const zip = new PizZip(content);
  const doc = new docxtemplater(zip, { delimiters: { start: "<<", end: ">>" } });
  doc.setData(datos);
  doc.render();
  saveAs(doc.getZip().generate({ type: "blob" }), nombre);
}

/**************************************
 * BOTÓN PRINCIPAL
 **************************************/
btnGenerar.onclick = async () => {
  try {
    estado.textContent = "⏳ Generando documento…";

    const despacho = DESPACHOS[despachoSelect.value];
    if (!despacho) throw new Error("Seleccione despacho.");

    const fiscal = fiscalInput.value.trim();
    if (!fiscal) throw new Error("Ingrese fiscal responsable.");

    const seleccion = obtenerDisposicionSeleccionada();
    if (!seleccion) throw new Error("Seleccione delito y disposición.");

    const texto = caseInput.value + "\n\n" + datosApoyoInput.value;
    if (texto.trim().length < 50) throw new Error("Texto insuficiente.");

    const datos = await ejecutarExtractor(texto);

    await generarWord(
      {
        ...datos,
        despacho: despacho.texto,
        fiscal_responsable: aFormatoTitulo(fiscal),
        fecha_actual: fechaLargaPeru()
      },
      seleccion.template,
      `disposicion_${seleccion.id}.docx`
    );

    estado.textContent = "✅ Documento generado correctamente.";
  } catch (e) {
    estado.textContent = "❌ Error: " + e.message;
  }
};
