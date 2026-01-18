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
  pfcc_1_1: {
    label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho",
    texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho"
  },
  pfcc_1_2: {
    label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho",
    texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho"
  },
  pfcc_1_3: {
    label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho",
    texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho"
  },
  pfcc_1_4: {
    label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho",
    texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho"
  },
  pfcc_1_5: {
    label: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho",
    texto: "Primera Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho"
  },

  pfcc_2_1: {
    label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho",
    texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 1° Despacho"
  },
  pfcc_2_2: {
    label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho",
    texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 2° Despacho"
  },
  pfcc_2_3: {
    label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho",
    texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 3° Despacho"
  },
  pfcc_2_4: {
    label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho",
    texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 4° Despacho"
  },
  pfcc_2_5: {
    label: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho",
    texto: "Segunda Fiscalía Corporativa Especializada en Ciberdelincuencia – 5° Despacho"
  }
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

/**************************************
 * MOSTRAR / OCULTAR TEXTO MANUAL
 **************************************/
btnTextoManual.onclick = () => {
  caseInput.classList.toggle("hidden");
};

/**************************************
 * DARK MODE
 **************************************/
toggleTheme.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/**************************************
 * API KEY
 **************************************/
function obtenerApiKey() {
  let key = localStorage.getItem("openai_api_key");

  if (!key) {
    key = prompt(
      "🔐 Ingrese su API Key de OpenAI\n" +
      "• Se guarda solo en este navegador\n" +
      "• Uso de prueba / demo"
    );

    if (!key || !key.trim()) {
      alert("No se ingresó una API Key válida.");
      throw new Error("API Key requerida");
    }

    localStorage.setItem("openai_api_key", key.trim());
    key = key.trim();
  }

  return key;
}

/**************************************
 * UTILIDADES DE FORMATO
 **************************************/
function aFormatoTitulo(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .filter(p => p.trim())
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function fechaLargaPeru(fecha = new Date()) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/**************************************
 * LIMPIEZA DE REMITENTE
 **************************************/
function limpiarRemitente(remitente, textoOriginal) {
  if (!textoOriginal) return "";

  const texto = textoOriginal.toUpperCase();
  const matchComisaria = texto.match(/(COMISAR[IÍ]A\s+PNP\s+[A-ZÁÉÍÓÚÑ\s]+)/i);

  if (matchComisaria) {
    return aFormatoTitulo(matchComisaria[1].trim());
  }

  if (remitente && remitente.split(" ").length <= 5) {
    return aFormatoTitulo(remitente);
  }

  return "Policía Nacional del Perú";
}

/**************************************
 * DEFENSA JSON
 **************************************/
function limpiarJSON(respuesta) {
  if (!respuesta) return "";
  return respuesta.replace(/```json/gi, "").replace(/```/g, "").trim();
}

/**************************************
 * PROMPT EXTRACTOR
 **************************************/
function construirPromptExtractor(texto) {
  return `
Devuelve EXCLUSIVAMENTE un JSON válido con los siguientes campos:
{
  "caso": "",
  "agraviado": "",
  "remitente": "",
  "oficio": "",
  "mes_hecho": "",
  "anio_hecho": "",
  "monto": "",
  "hechos": ""
}

REGLAS:
- No inventes información
- Sin conclusiones ni calificación jurídica
- Estilo narrativo fiscal

TEXTO:
${texto}
`;
}

/**************************************
 * EXTRACTOR IA
 **************************************/
async function ejecutarExtractor(texto) {
  const apiKey = obtenerApiKey();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: construirPromptExtractor(texto) }],
      temperature: 0
    })
  });

  const data = await response.json();
  const bruto = data.choices[0].message.content;
  const datos = JSON.parse(limpiarJSON(bruto));

  datos.agraviado = aFormatoTitulo(datos.agraviado);
  datos.remitente = limpiarRemitente(datos.remitente, texto);

  return datos;
}

/**************************************
 * SELECTORES DINÁMICOS
 **************************************/
Object.entries(DESPACHOS).forEach(([key, value]) => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = value.label;
  despachoSelect.appendChild(option);
});
/**************************************
 * RECORDAR DESPACHO (LOCAL STORAGE)
 **************************************/
const chkRecordarDespacho = document.getElementById("chkRecordarDespacho");

// Restaurar despacho guardado (una sola vez)
const recordarDespacho = localStorage.getItem("recordarDespacho") === "true";
const despachoGuardado = localStorage.getItem("despachoFiscal");

if (recordarDespacho && despachoGuardado && DESPACHOS[despachoGuardado]) {
  chkRecordarDespacho.checked = true;
  despachoSelect.value = despachoGuardado;
}

// Si cambia el despacho
despachoSelect.addEventListener("change", () => {
  if (chkRecordarDespacho.checked && despachoSelect.value) {
    localStorage.setItem("despachoFiscal", despachoSelect.value);
  }
});

// Si marca / desmarca recordar
chkRecordarDespacho.addEventListener("change", () => {
  if (chkRecordarDespacho.checked) {
    if (!despachoSelect.value) {
      alert("Seleccione un despacho antes de recordarlo.");
      chkRecordarDespacho.checked = false;
      return;
    }
    localStorage.setItem("recordarDespacho", "true");
    localStorage.setItem("despachoFiscal", despachoSelect.value);
  } else {
    localStorage.removeItem("recordarDespacho");
    localStorage.removeItem("despachoFiscal");
    despachoSelect.value = "";
  }
});

Object.entries(DISPOSICIONES).forEach(([key, value]) => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = value.label;
  delitoSelect.appendChild(option);
});

delitoSelect.onchange = () => {
  disposicionSelect.innerHTML =
    '<option value="">Seleccione disposición</option>';
  disposicionSelect.disabled = true;

  const delito = delitoSelect.value;
  if (!delito) return;

  DISPOSICIONES[delito].disposiciones.forEach(d => {
    const option = document.createElement("option");
    option.value = d.id;
    option.textContent = d.label;
    disposicionSelect.appendChild(option);
  });

  disposicionSelect.disabled = false;
};

function obtenerDisposicionSeleccionada() {
  const delito = delitoSelect.value;
  const dispId = disposicionSelect.value;
  if (!delito || !dispId) return null;

  return DISPOSICIONES[delito].disposiciones.find(d => d.id === dispId);
}

/**************************************
 * GENERADOR WORD
 **************************************/
async function generarWord(datos, template, nombre) {
  const response = await fetch(template);
  const content = await response.arrayBuffer();

  const zip = new PizZip(content);
  const doc = new docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "<<", end: ">>" }
  });

  doc.setData(datos);
  doc.render();

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });

  saveAs(blob, nombre);
}

/**************************************
 * PDF → TEXTO
 **************************************/
pdfInput.onchange = async () => {
  const file = pdfInput.files[0];
  if (!file) return;

  estado.textContent = "📄 Procesando PDF…";
  const reader = new FileReader();

  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let texto = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texto += content.items.map(i => i.str).join(" ") + "\n";
    }

    caseInput.value = texto;
    estado.textContent = "✅ PDF cargado.";
  };

  reader.readAsArrayBuffer(file);
};

/**************************************
 * BOTÓN PRINCIPAL
 **************************************/
btnGenerar.onclick = async () => {
  try {
    estado.textContent = "⏳ Generando documento…";

    // 1️⃣ Despacho
    const despachoId = despachoSelect.value;
    if (!despachoId) {
      alert("Seleccione el despacho fiscal.");
      return;
    }
    const despacho = DESPACHOS[despachoId];

    // 2️⃣ Fiscal responsable
    const fiscalResponsable = fiscalInput.value.trim();
    if (!fiscalResponsable) {
      alert("Ingrese el nombre del fiscal responsable.");
      return;
    }
    const fiscalFormateado = aFormatoTitulo(fiscalResponsable);

    // 3️⃣ Disposición
    const seleccion = obtenerDisposicionSeleccionada();
    if (!seleccion) {
      alert("Seleccione delito y disposición.");
      return;
    }

    // 4️⃣ Texto
    const texto = caseInput.value + "\n\n" + datosApoyoInput.value;
    if (texto.trim().length < 50) {
      alert("Texto insuficiente para generar disposición.");
      return;
    }

    // 5️⃣ Extractor
    const datos = await ejecutarExtractor(texto);

    // 6️⃣ Datos finales
    const datosFinales = {
      ...datos,
      despacho: despacho.texto,
      fiscal_responsable: fiscalFormateado,
      fecha_actual: fechaLargaPeru()
    };

    // 7️⃣ Generar Word
    await generarWord(
      datosFinales,
      seleccion.template,
      `disposicion_${seleccion.id}.docx`
    );

    estado.textContent = "✅ Documento generado correctamente.";
  } catch (e) {
    estado.textContent = "❌ Error: " + e.message;
  }
};
