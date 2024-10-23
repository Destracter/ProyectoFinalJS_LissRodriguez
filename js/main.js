let tarjetas = [];

async function fetchTarjetas() {
    const response = await fetch("./js/tarjetas.json");
    const data = await response.json();
    tarjetas = data;
    mostrarTarjetas(tarjetas);
}

fetchTarjetas();

const contenedorTarjetas = document.querySelector("#tarjetas");
const carritoVacio = document.querySelector("#carrito-vacio");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const carritoTarjetas = document.querySelector("#carrito-tarjetas");
const carritoTotal = document.querySelector("#total-carrito");
const tituloCategoria = document.querySelector("#tituloCategoria");
let carrito = [];

function mostrarTarjetas(tarjetas) {
    contenedorTarjetas.innerHTML = "";
    tarjetas.forEach((tarjeta) => {
        let div = document.createElement("div");
        div.classList.add("tarjeta");
        div.innerHTML = `
            <img class="tarjeta-img" src=${tarjeta.img} alt=${tarjeta.titulo}>
            <h3>${tarjeta.titulo}</h3>
            <p>$${tarjeta.precio}</p>
        `;
        let button = document.createElement("button");
        button.classList.add("tarjeta-btn");
        button.innerText = "Agregar al carrito";
        button.addEventListener("click", () => { agregaralcarrito(tarjeta) });

        div.append(button);
        contenedorTarjetas.append(div);
    });
}

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");
        
        const categoriaId = e.currentTarget.id;
        if (categoriaId !== "productos") {
            const tarjetasFiltradas = tarjetas.filter(tarjeta => tarjeta.categoria.id === categoriaId);
            mostrarTarjetas(tarjetasFiltradas);

            const categoriaNombre = e.currentTarget.textContent;
            tituloCategoria.textContent = categoriaNombre;
        } else {
            mostrarTarjetas(tarjetas);
            tituloCategoria.textContent = "Todos los Productos";
        }
    });
});

function actualizarcarrito() {
    if (carrito.length === 0) {
        carritoVacio.classList.remove("d-none");
        carritoTarjetas.classList.add("d-none");
    } else {
        carritoVacio.classList.add("d-none");
        carritoTarjetas.classList.remove("d-none");
        carritoTarjetas.innerHTML = "";
        carrito.forEach((tarjeta) => {
            let div = document.createElement("div");
            div.classList.add("carrito-tarjeta");
            div.innerHTML = `
                <h3>${tarjeta.titulo}</h3>
                <p>$${tarjeta.precio}</p>
                <p>Cant: ${tarjeta.cantidad}</p>
                <p>Subt: ${tarjeta.precio * tarjeta.cantidad}</p>
            `;
            let button = document.createElement("button");
            button.classList.add("carrito-tarjeta-btn");
            button.innerText = "X";
            button.addEventListener("click", () => { borrardelcarrito(tarjeta) });
            div.append(button);
            carritoTarjetas.append(div);
        });
        let comprarButton = document.createElement("button");
        comprarButton.classList.add("carrito-comprar-btn");
        comprarButton.innerText = "Comprar Todo";
        comprarButton.addEventListener("click", comprar);
        carritoTarjetas.append(comprarButton);
    }
}

async function comprar() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carrito: carrito,
                total: carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
            })
        });

        const data = await response.json();

        Swal.fire({
            title: '¡Compra realizada con éxito!',
            text: 'Tu compra se ha realizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
        carrito = [];
        actualizarcarrito();
        actualizarTotal();
        guardarCarrito();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Hubo un error al procesar la compra.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        console.error(error);
    }
}

function agregaralcarrito(tarjeta) {
    Toastify({
        text: "Agregado al Carrito",
        duration: 3000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function(){} // Callback after click
    }).showToast();

    let itemEncontrado = carrito.find((item) => item.id === tarjeta.id);
    if (itemEncontrado) {
        itemEncontrado.cantidad++;
    } else {
        carrito.push({ ...tarjeta, cantidad: 1 });
    }
    actualizarcarrito();
    actualizarTotal();
    guardarCarrito();
}

function borrardelcarrito(tarjeta) {
    let itemEncontrado = carrito.find((item) => item.id === tarjeta.id);
    if (itemEncontrado) {
        itemEncontrado.cantidad--;
        if (itemEncontrado.cantidad === 0) {
            let indice = carrito.findIndex((item) => item.id === tarjeta.id);
            carrito.splice(indice, 1);
        }
    }
    actualizarcarrito();
    actualizarTotal();
    guardarCarrito();
}

function actualizarTotal() {
    let total = carrito.reduce((acc, tar) => acc + (tar.precio * tar.cantidad), 0);
    carritoTotal.innerText = `$${total}`;
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


function cargarCarrito() {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
      actualizarcarrito();
      actualizarTotal();
  }
}

document.addEventListener("DOMContentLoaded", cargarCarrito);