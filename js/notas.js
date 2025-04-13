class Nota {
    constructor(titulo, descripcion, tipo, id = new Date().getTime().toString(),
        fecha = new Date().toLocaleDateString(), ediciones = 0) {
        // new Date().getTime().toString(); Obtiene el tiempo en milisegundos desde el 1 de enero de 1970
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.id = id;
        this.fecha = fecha;
        this.ediciones = ediciones;
    }
}

// let nota1 = new Nota('nota1', 'es la nota1', 'trabajo');
// console.log('nota1: ' + nota1.id + ' ' + nota1.fecha);

const formulario = document.getElementById("formNota");
const listaNotas = document.getElementById("listaNotas");
const modalElement = document.getElementById('staticBackdrop');

let paginaActual = 1;
const notasPorPagina = 5;

const notas = cargarNotasDesdeStorage();
mostrarNotas();

let notaEditandoId = null;

formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const tituloTexto = document.getElementById("titulo").value.trim();
    const descripcionTexto = document.getElementById("descripcion").value.trim();
    if (!tituloTexto || !descripcionTexto) {
        alertaSimple("error", "Ni el campo título ni el campo descripción pueden estar vacíos");
        return
    }

    const titulo = tituloTexto.replace(tituloTexto[0], tituloTexto[0].toUpperCase());
    const descripcion = descripcionTexto.replace(descripcionTexto[0], descripcionTexto[0].toUpperCase());

    const tipo = document.getElementById("tipo").value;
    if (tipo === '0') {
        alertaSimple("error", "Debes seleccionar una opción para subir la nota");
        return
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
    const closeModal = document.querySelector(".modal-header");

    if (notaEditandoId) {
        // Estamos actualizando una nota existente
        const nota = notas.find(n => n.id === notaEditandoId);
        if (nota) {
            // Cuando oprimen el botón actualizar nota sin haber cambiado ningún valor
            if (nota.titulo === titulo &&
                nota.descripcion === descripcion &&
                nota.tipo === tipo) {

                alertaSimple("info", "No se ha cambiado la información de la nota");

                notaEditandoId = null;
                cambiarEstadoBotonSubmit("Agregar nota", "btn-primary", "btn-warning");
                guardarNotasEnStorage(notas);
                mostrarNotas();
                formulario.reset();
                toggleBotonesEstado(false);
                closeModal.classList.remove("d-none");
                modal.hide();

            } else {

                Swal.fire({
                    title: "¿Estás seguro de editar esta nota?",
                    text: "Si la editas no podrás deshacer la acción",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Si, editar la nota",
                    cancelButtonText: "Cancelar edición"
                }).then((result) => {
                    if (result.isConfirmed) {
                        nota.titulo = titulo;
                        nota.descripcion = descripcion;
                        nota.tipo = tipo;
                        nota.ediciones++;

                        notaEditandoId = null;
                        cambiarEstadoBotonSubmit("Agregar nota", "btn-primary", "btn-warning");
                        guardarNotasEnStorage(notas);
                        toggleBotonesEstado(false);
                        closeModal.classList.remove("d-none");
                        formulario.reset();
                        modal.hide();
                        mostrarNotas();                        
        
                        alertaSimple("success", "La nota ha sido editada exitosamente");
                        return
                    }
                    else {
                        // Usuario canceló la edición
                        formulario.reset();
                        modal.hide();
                        notaEditandoId = null;
                        cambiarEstadoBotonSubmit("Agregar nota", "btn-primary", "btn-warning");
                        //Habilitar botones
                        toggleBotonesEstado(false);
                        closeModal.classList.remove("d-none");
                    }
                });
            }
        }
    } else {
        // Crear nueva nota
        const nuevaNota = new Nota(titulo, descripcion, tipo);
        notas.push(nuevaNota);
        guardarNotasEnStorage(notas);
        formulario.reset();
        modal.hide();
        alertaSimple("success", "La nota se ha creado exitosamente");

        const totalPaginas = Math.ceil(notas.length / notasPorPagina);
        paginaActual = totalPaginas;
        mostrarNotas();
    }
});

modalElement.addEventListener('hidden.bs.modal', function () {
    formulario.reset();
    formulario.dataset.editando = "";
    cambiarEstadoBotonSubmit("Guardar nota", "btn-primary", "btn-warning");
});


function guardarNotasEnStorage(notas) {
    localStorage.setItem("notas", JSON.stringify(notas));
}

function cargarNotasDesdeStorage() {
    const datos = localStorage.getItem("notas");
    if (!datos) return [];

    // Convertimos objetos planos en instancias de Nota
    const objetos = JSON.parse(datos);
    return objetos.map(obj => new Nota(obj.titulo, obj.descripcion, obj.tipo, obj.id, obj.fecha, obj.ediciones ?? 0));

}

function mostrarNotas() {
    const headerNotas = document.getElementById("header-notas");
    const btnEliminarTodo = document.getElementById("btn-eliminar-todo");
    listaNotas.innerHTML = "";

    if (notas.length === 0) {
        listaNotas.innerHTML += `<p class="text-center">No tienes notas guardadas</p>`;
    } else {
        const inicio = (paginaActual - 1) * notasPorPagina;
        const fin = inicio + notasPorPagina;
        const notasPaginadas = notas.slice(inicio, fin);

        const filas = notasPaginadas.map((nota) => {
            const categoria = nota.tipo == 1 ? 'Trabajo' : nota.tipo == 2 ? 'Estudio' : 'Personal';

            return `
            <tr class="text-center">
                <td>${nota.titulo}</td>
                <td>${nota.descripcion}</td>
                <td>${categoria}</td>
                <td>${nota.fecha}</td>
                <td>
                    <div class="d-flex justify-content-center gap-2">
                        <button type="button" class="btn btn-success btn-sm btn-editar" data-bs-toggle="modal" data-bs-target="#staticBackdrop" 
                        onclick="editarNota('${nota.id}')">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar" onclick="eliminarNota('${nota.id}')">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                </td>
                <td>${nota.ediciones}</td>
            </tr>`;
        }).join("");

        listaNotas.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover border-dark">
                <thead class="text-center table-warning">
                    <tr>
                        <th scope="col">Título</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Categoría</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Acciones</th>
                        <th scope="col"># de ediciones</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider">
                    ${filas}
                </tbody>
            </table>
        </div>`;

        // Paginación
        if (notas.length > notasPorPagina) {
            const totalPaginas = Math.ceil(notas.length / notasPorPagina);
            listaNotas.innerHTML += `
            <div class="d-flex justify-content-center gap-2 mt-3">
                <button class="btn btn-outline-info btn-anterior" ${paginaActual === 1 ? 'disabled' : ''} onclick="cambiarPagina(-1)">Anterior</button>
                <span class="fw-bold">Página ${paginaActual} de ${totalPaginas}</span>
                <button class="btn btn-outline-info btn-siguiente" ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="cambiarPagina(1)">Siguiente</button>
            </div>`;
        }
    }

    // ENcabezado tabla
    if (notas.length === 0 || notas.length === 1) {
        headerNotas.classList.add("justify-content-center");
        headerNotas.classList.remove("justify-content-between", "align-items-center");
        btnEliminarTodo.classList.add("d-none");
        btnEliminarTodo.classList.remove("d-inline");
    } else {
        headerNotas.classList.remove("justify-content-center");
        headerNotas.classList.add("justify-content-between", "align-items-center");
        btnEliminarTodo.classList.remove("d-none");
        btnEliminarTodo.classList.add("d-inline");
    }
}

function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(notas.length / notasPorPagina);
    paginaActual += direccion;
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    mostrarNotas();
}

function editarNota(id) {
    //formulario.scrollIntoView({ behavior: 'smooth' });
    document.getElementById("titulo").focus();
    const nota = notas.find(n => n.id === id);
    if (!nota) return;

    // Cargar los valores en el formulario
    document.getElementById("titulo").value = nota.titulo;
    document.getElementById("descripcion").value = nota.descripcion;
    document.getElementById("tipo").value = nota.tipo;

    // Guardar el id que se está editando
    notaEditandoId = id;

    // Cambiar el botón del formulario
    cambiarEstadoBotonSubmit("Actualizar nota", "btn-warning", "btn-primary");

    //Deshabilitar botones
    const closeModal = document.querySelector(".modal-header");
    closeModal.classList.add("d-none");
    toggleBotonesEstado(true, "d-none");
}

function eliminarNota(id) {
    Swal.fire({
        title: "¿Estás seguro de eliminar esta nota?",
        text: "Si la eliminas no la podrás recuperar",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Si, borrar la nota",
        cancelButtonText: "Conservar la nota"
    }).then((result) => {
        if (result.isConfirmed) {
            // 1. Quitar la nota del array
            const index = notas.findIndex(nota => nota.id === id);
            if (index !== -1) {
                notas.splice(index, 1); // quitar del array
                guardarNotasEnStorage(notas); // actualizar storage
                const totalPaginas = Math.ceil(notas.length / notasPorPagina);
                if (paginaActual > totalPaginas) {
                    paginaActual = Math.max(1, totalPaginas);
                }
                mostrarNotas(); // volver a pintar las notas
            }
            alertaSimple("success", "La nota se ha eliminado");
        }
    });
}

function eliminarTodasLasNotas() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Con esta acción eliminarás todas las notas de la lista",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Si, borrar la lista de notas",
        cancelButtonText: "Conservar la lista de notas"
    }).then((result) => {
        if (result.isConfirmed) {
            notas.length = 0;
            paginaActual = 1;
            guardarNotasEnStorage();
            mostrarNotas();
            localStorage.removeItem("notas");
            alertaSimple("success", "La lista de notas se ha borrado");
        }
    });
}


//FUNCIONES AUXILIARES
function cambiarEstadoBotonSubmit(texto, claseAgregar, claseQuitar) {
    const botonSubmit = formulario.querySelector("button[type='submit']");
    botonSubmit.textContent = texto;
    botonSubmit.classList.remove(claseQuitar);
    botonSubmit.classList.add(claseAgregar);
}

function toggleBotonesEstado(disabled, display = "d-inline") {
    document.querySelectorAll(".btn-anterior, .btn-siguiente").forEach(btn => {
        btn.classList.add(display);
    });

    document.querySelectorAll(".btn-eliminar, .btn-editar").forEach(btn => {
        btn.disabled = disabled;
    });
    const btnEliminarTodo = document.querySelector(".btn-eliminar-todo");
    if (btnEliminarTodo) btnEliminarTodo.disabled = disabled;
}

function alertaSimple(icono, texto) {
    Swal.fire({
        icon: icono,
        text: texto,
    });
}
