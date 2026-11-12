// 1. Catálogo (Carga al instante, sin esperar a internet)
const productos = [
    { id: 1, nombre: "Cortina Roller Blackout", desc: "Bloquea 100% la luz. Ideal para dormitorios.", precio: 180.00 },
    { id: 2, nombre: "Cortina Roller Screen", desc: "Filtra el sol manteniendo la vista exterior.", precio: 160.00 },
    { id: 3, nombre: "Cortina de Tela Lino", desc: "Elegante caída natural para salas.", precio: 220.00 },
    { id: 4, nombre: "Persiana Veneciana", desc: "Láminas de aluminio ajustables.", precio: 140.00 },
    { id: 5, nombre: "Riel de Aluminio Reforzado", desc: "Barra de 2 metros con soportes.", precio: 65.00 },
    { id: 6, nombre: "Servicio de Instalación", desc: "Visita técnica y colocación por ventana.", precio: 50.00 }
];

// --- DATOS DE TU SUPABASE ---
const SUPABASE_URL = "https://grvldtrjckxmrmbrmwng.supabase.co";
const SUPABASE_KEY = "sb_publishable_hA7SRvqqg976srbEyyOjhg_vnvuLnsa";

let carrito = [];

const contenedorProductos = document.getElementById("lista-productos");
const listaCarrito = document.getElementById("items-carrito");
const totalPrecio = document.getElementById("total-precio");
const btnVaciar = document.getElementById("btn-vaciar");
const btnCotizar = document.getElementById("btn-cotizar");
const inputCliente = document.getElementById("nombre-cliente");

// 2. Dibujar catálogo
function renderizarProductos() {
    productos.forEach(prod => {
        const div = document.createElement("div");
        div.classList.add("tarjeta");
        div.innerHTML = `
            <div>
                <h3>${prod.nombre}</h3>
                <p>${prod.desc}</p>
            </div>
            <div>
                <div class="precio">S/ ${prod.precio.toFixed(2)}</div>
                <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">Agregar</button>
            </div>
        `;
        contenedorProductos.appendChild(div);
    });
}

// 3. Agregar y Eliminar individual
function agregarAlCarrito(id) {
    const productoEncontrado = productos.find(p => p.id === id);
    carrito.push(productoEncontrado);
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

// 4. Actualizar vista del carrito
function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `<li class="vacio">Aún no has agregado productos</li>`;
    } else {
        carrito.forEach((item, index) => {
            total += item.precio;
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${item.nombre}</span>
                <div class="item-derecha">
                    <span>S/ ${item.precio.toFixed(2)}</span>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">X</button>
                </div>
            `;
            listaCarrito.appendChild(li);
        });
    }

    totalPrecio.textContent = `S/ ${total.toFixed(2)}`;
}

// 5. Vaciar y Enviar Pedido directo a la API de Supabase
btnVaciar.addEventListener("click", () => {
    carrito = [];
    actualizarCarrito();
});

btnCotizar.addEventListener("click", async () => {
    const cliente = inputCliente.value.trim();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    if (cliente === "") {
        alert("Por favor escribe tu nombre y WhatsApp para contactarte.");
        return;
    }

    const resumenProductos = carrito.map(item => item.nombre).join(", ");
    const totalNumerico = carrito.reduce((suma, item) => suma + item.precio, 0);

    btnCotizar.textContent = "Enviando...";

    try {
        // Enviamos los datos directo por HTTP sin librerías pesadas
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                cliente: cliente,
                productos: resumenProductos,
                total: totalNumerico
            })
        });

        if (respuesta.ok) {
            alert("¡Pedido guardado en Supabase! Revisa tu tabla.");
            carrito = [];
            inputCliente.value = "";
            actualizarCarrito();
        } else {
            const errorTexto = await respuesta.text();
            alert("Supabase rechazó el guardado: " + errorTexto);
        }
    } catch (err) {
        alert("Error de conexión: " + err.message);
    }

    btnCotizar.textContent = "Enviar Pedido Real";
});

// Arrancar la tienda al instante
renderizarProductos();


