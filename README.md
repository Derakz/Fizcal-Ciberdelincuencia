# ⚖️ Fizcal Ciberdelincuencia  
**Módulo de Fizcal Suite**

Fizcal Ciberdelincuencia es una aplicación web **frontend-only** diseñada para apoyar el trabajo fiscal en el Perú, permitiendo **generar documentos Word oficiales** a partir de textos o PDFs de denuncias, mediante **extracción estructurada con IA**.

El sistema está pensado para uso real en despachos fiscales, incluso en **entornos institucionales con proxy**, sin necesidad de backend.

---

## 🎯 Objetivo del proyecto

Reducir el tiempo operativo del fiscal y del asistente fiscal en la elaboración de disposiciones, evitando errores de transcripción y estandarizando documentos conforme a la práctica fiscal.

---

## 🧩 Funcionalidades principales

- 📄 **Carga de casos fiscales** mediante:
  - Texto pegado manualmente
  - Archivos PDF (procesados con `pdf.js`)
- 🤖 **Extracción de datos con IA (OpenAI)**:
  - Uso exclusivo como extractor
  - Prompt estricto que devuelve **solo JSON**
  - Sin redacción ni calificación jurídica en los hechos
- 🧹 **Normalización automática**:
  - Nombres propios en formato título
  - Remitente priorizado como **entidad**
  - Fecha fiscal larga (formato peruano)
- 📝 **Generación de documentos Word (.docx)**:
  - Plantillas oficiales con marcadores `<< >>`
  - Archivos listos para revisión y firma
- 🌗 **Modo claro / modo oscuro**
- 💻 **100% frontend (HTML + CSS + JS)**

---

## 📂 Disposiciones implementadas

- ✔️ Disposición de Apertura – Fraude Informático  
- ✔️ Disposición de Archivo Liminar por Monto Mínimo – Fraude Informático  

> El sistema está diseñado para escalar fácilmente a más tipos de disposiciones y materias.

---

## 🏗️ Arquitectura

- Un solo **extractor IA**
- Múltiples **plantillas Word**
- Función central `generarWord(datos, tipo)`
- Mapeo de plantillas definido en JavaScript

---

## 🔐 Uso de OpenAI

- El usuario ingresa su **propia API Key**
- La clave se almacena **solo en el navegador (localStorage)**
- No se envía ni se guarda en servidores externos
- El modelo se utiliza únicamente para **extracción estructurada**

---

## 🌐 Compatibilidad

- Funciona en:
  - Live Server
  - GitHub Pages
- Compatible con redes institucionales con proxy
- No requiere instalación ni dependencias del sistema

---

## 🚧 Estado del proyecto

- 🟢 Estable
- 🧪 En expansión de plantillas
- 🔜 Próximo paso:
  - Selector de más tipos de disposición
  - Nuevos módulos dentro de **Fizcal Suite**

---

## 🧠 Filosofía del proyecto

> La IA no reemplaza al fiscal.  
> **Le quita carga operativa para que decida mejor.**

---

## 👤 Autor

Creado por **Jhonathan Anthony Andres Barba**  
Software privado de apoyo al trabajo fiscal.

---

## ⚠️ Aviso legal

Este proyecto es una herramienta de apoyo.  
La responsabilidad final sobre el contenido, criterio jurídico y firma del documento corresponde exclusivamente al operador humano.

---

© 2026 Fizcal Suite. Todos los derechos reservados.
