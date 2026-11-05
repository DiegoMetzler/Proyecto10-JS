// Simulador de Productos - Pinturest

// CLASE Producto
class Producto {
    constructor(id, nombre, precio, stock, categoria) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.categoria = categoria;
    }
}

// ESTADO: arranca vacio, se llena con el fetch
let catalogo = [];

// SELECCION DE ELEMENTOS DEL DOM
const contenedor = document.querySelector("#contenedor-productos");
const inputNombre = document.querySelector("#inputNombre");
const inputPrecio = document.querySelector("#inputPrecio");
const inputStock = document.querySelector("#inputStock");
const inputCategoria = document.querySelector("#inputCategoria");
const btnAgregar = document.querySelector("#btnAgregar");
const inputBuscar = document.querySelector("#inputBuscar");
const cargando = document.querySelector("#cargando");

// NOTIFICACION con Toastify
function notificar(texto, tipo) {
    Toastify({
        text: texto,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: tipo === "exito" ? "#198754" : "#dc3545"
        }
    }).showToast();
}

// LOCALSTORAGE
function guardarEnStorage() {
    localStorage.setItem("catalogo", JSON.stringify(catalogo));
}

// FETCH - trae los productos del data.json
async function obtenerProductos() {
    const response = await fetch("data.json");

    // fetch NO lanza error con 404 o 500, hay que chequearlo a mano
    if (!response.ok) {
        throw new Error(`Error ${response.status} al leer los datos`);
    }

    return await response.json();
}

// FUNCION DE RENDERIZADO
function renderizarProductos(lista) {
    contenedor.innerHTML = lista.length === 0
        ? "<p class='sin-resultados'>No se encontraron productos.</p>"
        : lista.map(producto => {
            // DESTRUCTURING
            const { id, nombre, precio, stock, categoria } = producto;
            return `
                <div class="producto-card" id="producto-${id}">
                    <span class="categoria">${categoria}</span>
                    <h3>${nombre}</h3>
                    <p class="precio">$${precio.toLocaleString()}</p>
                    <p>Stock: ${stock > 0 ? `${stock} unidades` : "Sin stock"}</p>
                    <button onclick="eliminarProducto(${id})">🗑 Eliminar</button>
                </div>
            `;
        }).join("");
}

// CARGA INICIAL con async/await + try/catch/finally
async function cargarCatalogo() {
    cargando.classList.remove("oculto");

    try {
        // Si ya hay datos guardados (agregados/eliminados por el usuario) se usan esos.
        // Si no, se piden al data.json con fetch.
        const guardados = JSON.parse(localStorage.getItem("catalogo"));
        catalogo = guardados ?? await obtenerProductos();

        renderizarProductos(catalogo);
        notificar(`✅ ${catalogo.length} productos cargados con éxito`, "exito");
    } catch (error) {
        contenedor.innerHTML = "";
        notificar(`❌ No se pudieron cargar los productos: ${error.message}`, "error");
    } finally {
        // Se ejecuta SIEMPRE
        cargando.classList.add("oculto");
    }
}

// ELIMINAR PRODUCTO con confirmacion de SweetAlert2
async function eliminarProducto(id) {
    const producto = catalogo.find(p => p.id === id);

    const resultado = await Swal.fire({
        title: "¿Eliminar producto?",
        text: `Se va a eliminar "${producto.nombre}" del catálogo.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545"
    });

    if (resultado.isConfirmed) {
        catalogo = catalogo.filter(p => p.id !== id);
        guardarEnStorage();
        renderizarProductos(catalogo);
        notificar("🗑 Producto eliminado correctamente", "exito");
    }
}

// EVENTO CLICK - Agregar producto
btnAgregar.addEventListener("click", () => {
    const nombre = inputNombre.value.trim();
    const precio = Number(inputPrecio.value);
    const stock = Number(inputStock.value);
    const categoria = inputCategoria.value;

    if (!nombre || !precio || !stock || !categoria) {
        Swal.fire({
            title: "Faltan datos",
            text: "Completá todos los campos para agregar el producto.",
            icon: "error",
            confirmButtonColor: "#212529"
        });
        return;
    }

    const nuevoId = catalogo.length > 0 ? catalogo[catalogo.length - 1].id + 1 : 1;
    catalogo.push(new Producto(nuevoId, nombre, precio, stock, categoria));

    guardarEnStorage();
    renderizarProductos(catalogo);
    notificar(`✅ "${nombre}" agregado al catálogo`, "exito");

    inputNombre.value = "";
    inputPrecio.value = "";
    inputStock.value = "";
    inputCategoria.value = "";
});

// EVENTO TECLADO - Filtrar productos
inputBuscar.addEventListener("keyup", () => {
    const busqueda = inputBuscar.value.toLowerCase();
    const filtrados = catalogo.filter(p => p.nombre.toLowerCase().includes(busqueda));
    renderizarProductos(filtrados);
});

// INICIO
cargarCatalogo();