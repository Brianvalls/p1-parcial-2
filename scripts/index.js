'use strict';

/*
 * VALLS, BRIAN | 
 */

// Podria levantar los productos de un JSON o directamente estar escritos 



// Clase carrito
class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
    }

    agregarProducto(producto) {
        const item = this.items.find(i => i.id === producto.id);
        if (item) {
            if (item.cantidad < producto.stock) {
                item.cantidad++;
            }
        } else {
            this.items.push({ ...producto, cantidad: 1 });
        }
        this.guardar();
    }

    quitarProducto(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.cantidad--;
            if (item.cantidad <= 0) {
                this.items = this.items.filter(i => i.id !== id);
            }
            this.guardar();
        }
    }

    eliminarProducto(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.guardar();
    }

    vaciarCarrito() {
        this.items = [];
        this.guardar();
    }

    totalCantidad() {
        return this.items.reduce((acc, item) => acc + item.cantidad, 0);
    }

    totalPrecio() {
        return this.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    }

    guardar() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }
}


let productos = [];
const carrito = new Carrito();


async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        productos = await response.json();
        mostrarCatalogo(productos);
        actualizarMiniCarrito();
        cargarFiltros();
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarCatalogo(lista) {
    const catalogo = document.getElementById('catalogo');
    catalogo.innerHTML = '';
    
    lista.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';

        const img = document.createElement('img');
        img.src = producto.imagen;
        img.alt = producto.nombre;
        img.addEventListener('click', () => mostrarDetalleProducto(producto));

        const nombre = document.createElement('h3');
        nombre.textContent = producto.nombre;

        const precio = document.createElement('p');
        precio.textContent = `$${producto.precio}`;

        const btnAgregar = document.createElement('button');
        btnAgregar.textContent = 'Agregar al carrito';
        btnAgregar.disabled = producto.stock === 0;
        btnAgregar.addEventListener('click', () => {
            carrito.agregarProducto(producto);
            actualizarMiniCarrito();
        });

        card.appendChild(img);
        card.appendChild(nombre);
        card.appendChild(precio);
        card.appendChild(btnAgregar);

        catalogo.appendChild(card);
    });
}

function mostrarDetalleProducto(producto) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
    modalContainer.className = 'active';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre;

    const nombre = document.createElement('h2');
    nombre.textContent = producto.nombre;

    const desc = document.createElement('p');
    desc.textContent = producto.descripcion;

    const precio = document.createElement('p');
    precio.textContent = `Precio: $${producto.precio}`;

    const stock = document.createElement('p');
    stock.textContent = `Stock: ${producto.stock}`;

    const btnAgregar = document.createElement('button');
    btnAgregar.textContent = 'Agregar al carrito';
    btnAgregar.disabled = producto.stock === 0;
    btnAgregar.addEventListener('click', () => {
        carrito.agregarProducto(producto);
        actualizarMiniCarrito();
        cerrarModal();
    });

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.addEventListener('click', cerrarModal);

    modal.appendChild(img);
    modal.appendChild(nombre);
    modal.appendChild(desc);
    modal.appendChild(precio);
    modal.appendChild(stock);
    modal.appendChild(btnAgregar);
    modal.appendChild(btnCerrar);

    modalContainer.appendChild(modal);
}

function mostrarModalCarrito() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
    modalContainer.className = 'active';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Carrito de compras';

    modal.appendChild(titulo);

    if (carrito.items.length === 0) {
        const vacio = document.createElement('p');
        vacio.textContent = 'El carrito está vacío.';
        modal.appendChild(vacio);
    } else {
        carrito.items.forEach(item => {
            const prod = document.createElement('div');
            prod.className = 'carrito-item';

            const img = document.createElement('img');
            img.src = item.imagen;
            img.alt = item.nombre;
            img.className = 'miniatura';

            const nombre = document.createElement('span');
            nombre.textContent = item.nombre;

            const cantidad = document.createElement('span');
            cantidad.textContent = `Cantidad: ${item.cantidad}`;

            const subtotal = document.createElement('span');
            subtotal.textContent = `Subtotal: $${item.precio * item.cantidad}`;

            const btnSumar = document.createElement('button');
            btnSumar.textContent = '+';
            btnSumar.disabled = item.cantidad >= item.stock;
            btnSumar.addEventListener('click', () => {
                carrito.agregarProducto(item);
                mostrarModalCarrito();
                actualizarMiniCarrito();
            });

            const btnRestar = document.createElement('button');
            btnRestar.textContent = '-';
            btnRestar.addEventListener('click', () => {
                carrito.quitarProducto(item.id);
                mostrarModalCarrito();
                actualizarMiniCarrito();
            });

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.addEventListener('click', () => {
                carrito.eliminarProducto(item.id);
                mostrarModalCarrito();
                actualizarMiniCarrito();
            });

            prod.appendChild(img);
            prod.appendChild(nombre);
            prod.appendChild(cantidad);
            prod.appendChild(subtotal);
            prod.appendChild(btnSumar);
            prod.appendChild(btnRestar);
            prod.appendChild(btnEliminar);

            modal.appendChild(prod);
        });

        const total = document.createElement('p');
        total.textContent = `Total: $${carrito.totalPrecio()}`;
        modal.appendChild(total);

        const btnVaciar = document.createElement('button');
        btnVaciar.textContent = 'Vaciar carrito';
        btnVaciar.addEventListener('click', () => {
            carrito.vaciarCarrito();
            mostrarModalCarrito();
            actualizarMiniCarrito();
        });
        modal.appendChild(btnVaciar);
    }

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.addEventListener('click', cerrarModal);

    modal.appendChild(btnCerrar);
    modalContainer.appendChild(modal);
}

function actualizarMiniCarrito() {
    const mini = document.getElementById('mini-carrito');
    mini.innerHTML = '';
    
    const cantidad = document.createElement('span');
    cantidad.textContent = `${carrito.totalCantidad()} items`;
    
    const total = document.createElement('span');
    total.textContent = `$${carrito.totalPrecio()}`;
    
    const btnVer = document.createElement('button');
    btnVer.textContent = 'Ver carrito';
    btnVer.addEventListener('click', mostrarModalCarrito);
    
    mini.appendChild(cantidad);
    mini.appendChild(total);
    mini.appendChild(btnVer);
}

function cargarFiltros() {
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const selectCat = document.getElementById('categoria-filtro');
    
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        selectCat.appendChild(opt);
    });

    
    selectCat.addEventListener('change', aplicarFiltros);
    document.getElementById('precio-min').addEventListener('input', aplicarFiltros);
    document.getElementById('precio-max').addEventListener('input', aplicarFiltros);
    document.getElementById('orden-precio').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const categoria = document.getElementById('categoria-filtro').value;
    const precioMin = Number(document.getElementById('precio-min').value) || 0;
    const precioMax = Number(document.getElementById('precio-max').value) || Infinity;
    const orden = document.getElementById('orden-precio').value;

    let lista = [...productos];

   
    if (categoria) {
        lista = lista.filter(p => p.categoria === categoria);
    }

   
    lista = lista.filter(p => p.precio >= precioMin && p.precio <= precioMax);

   
    lista.sort((a, b) => {
        return orden === 'asc' ? a.precio - b.precio : b.precio - a.precio;
    });

    mostrarCatalogo(lista);
}



function cerrarModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.className = '';
    modalContainer.innerHTML = '';
}


document.addEventListener('DOMContentLoaded', cargarProductos);
