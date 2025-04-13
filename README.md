# 📝 Aplicación de Notas

Este es un proyecto de aprendizaje desarrollado con JavaScript puro. Consiste en una aplicación web de notas que permite al usuario agregar, editar, eliminar y paginar notas de forma sencilla. Es una excelente práctica para desarrollar la lógica de programación y descubrir nuevas funciones del lenguaje.

## 🚀 Tecnologías utilizadas

- HTML
- Bootstrap (vía CDN)
- JavaScript

## 📦 Requisitos previos

No se necesita instalar nada. Solo un navegador web moderno.

## 🔧 Instalación

1. Clona el repositorio o descarga los archivos `index.html` y el archivo JavaScript correspondiente (`script.js`, por ejemplo).
2. Abre `index.html` en tu navegador. ¡Y listo!

## 🛠️ Instrucciones de uso

- Haz clic en el botón **"Agregar nota"** para abrir un modal con un formulario.
- Completa el **título**, **descripción** y **tipo de nota** (personal, estudios o trabajo).
- Una vez guardada la nota:
  - Aparece listada junto con las demás.
  - Puedes **editarla** o **eliminarla** con los botones correspondientes.
  - Si editas la nota y cambias su contenido, se incrementa el **contador de ediciones**.
- Si hay más de una nota, aparece un botón **"Eliminar todas las notas"** para borrarlas de una vez.
- Las notas se guardan en el almacenamiento local del navegador (`localStorage`).
- Se muestran **5 notas por página** para una mejor organización.
