/**************************************
 * CONFIGURACIÓN GENERAL
 **************************************/
const OPENAI_MODEL = "gpt-4.1-mini";

const TEMPLATES = {
  apertura: "plantilla_apertura_fraude.docx",
  archivo_monto: "plantilla_archivo_monto_minimo.docx"
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

  const matchComisaria = texto.match(
    /(COMISAR[IÍ]A\s+PNP\s+[A-ZÁÉÍÓÚÑ\s]+)/i
  );
  if (matchComisaria) {
    return aFormatoTitulo(matchComisaria[1].trim());
  }

  const matchDependencia = texto.match(
    /(DIVISI[ÓO]N|DEPARTAMENTO|SECCI[ÓO]N)\s+PNP\s+[A-ZÁÉÍÓÚÑ\s]+/i
  );
  if (matchDependencia) {
    return aFormatoTitulo(matchDependencia[0].trim());
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
  return respuesta
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

/**************************************
 * PROMPT EXTRACTOR (HECHOS PUROS)
 **************************************/
function construirPromptExtractor(texto) {
  return `
TAREA:
Analiza el texto proporcionado y EXTRAE únicamente la información solicitada.

REGLAS OBLIGATORIAS:
- Devuelve EXCLUSIVAMENTE un objeto JSON válido.
- NO incluyas explicaciones ni texto adicional.
- NO inventes información.
- Si un dato no aparece, devuelve "".
- Usa español formal, impersonal y objetivo.
- Los nombres de personas deben devolverse en formato título.
- El campo "remitente" debe contener SOLO la ENTIDAD (no personas).

REGLA ESPECIAL PARA EL CAMPO "hechos":
- El campo "hechos" debe contener ÚNICAMENTE una narración objetiva y cronológica.
- NO debe incluir calificación jurídica, conclusiones ni interpretaciones.
- NO usar expresiones como: "presuntamente", "se habría", "configuraría",
  "constituiría", "delito", "fraude", "manipulación", "ilícito".
- Limítate a describir lo ocurrido, cuándo ocurrió y cómo ocurrió.

FORMATO:
{
  "caso": "",
  "agraviado": "",
  "remitente": "",
  "oficio": "",
  "mes_hecho": "",
  "anio_hecho": "",
  "monto": "",
  "hechos": "Narración objetiva y cronológica de los hechos, sin calificación jurídica"
}

TEXTO:
${texto}
`;
}

/**************************************
 * EXTRACTOR IA
 **************************************/
async function ejecutarExtractor(texto) {
  const apiKey = obtenerApiKey();

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
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
    }
  );

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error("Respuesta inválida de OpenAI");
  }

  const bruto = data.choices[0].message.content;
  const jsonLimpio = limpiarJSON(bruto);
  const datos = JSON.parse(jsonLimpio);

  datos.agraviado = aFormatoTitulo(datos.agraviado);
  datos.remitente = limpiarRemitente(datos.remitente, texto);

  return datos;
}

/**************************************
 * GENERADOR WORD
 **************************************/
async function generarWord(datos, tipo) {
  const plantilla = TEMPLATES[tipo];
  if (!plantilla) throw new Error("Plantilla no definida");

  const response = await fetch(plantilla);
  const content = await response.arrayBuffer();

  const zip = new PizZip(content);
  const doc = new window.docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "<<", end: ">>" }
  });

  doc.setData({
    ...datos,
    fecha_actual: fechaLargaPeru()
  });

  doc.render();

  const blob = doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });

  saveAs(blob, `disposicion_${tipo}.docx`);
}

/**************************************
 * PDF → TEXTO (PDF.js)
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
      const strings = content.items.map(item => item.str).join(" ");
      texto += strings + "\n";
    }

    caseInput.value = texto;
    estado.textContent = "✅ PDF cargado correctamente.";
  };

  reader.readAsArrayBuffer(file);
};

/**************************************
 * BOTÓN PRINCIPAL
 **************************************/
btnGenerar.onclick = async () => {
  try {
    estado.textContent = "⏳ Generando documento…";

    const tipo = document.querySelector("input[name='tipo']:checked").value;

    const textoBase = caseInput.value || "";
    const apoyo = datosApoyoInput.value || "";

    const textoFinal =
      textoBase + "\n\nDATOS ADICIONALES (si los hubiera):\n" + apoyo;

    const datos = await ejecutarExtractor(textoFinal);
    await generarWord(datos, tipo);

    estado.textContent = "✅ Documento generado correctamente.";
  } catch (err) {
    estado.textContent = "❌ Error: " + err.message;
  }
};
