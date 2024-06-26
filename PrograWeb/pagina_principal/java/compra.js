const precios = {
    1: 29990,
    2: 379990,
    3: 4520000,
    4: 49990,
    5: 6239990,
    6: 3699990,
    7: 1299990
};

const calcularPrecio = (base, plan) => {
    if (plan === 'platino') return base * 1.1;
    if (plan === 'plus') return base * 1.2;
    return base; // Básico
};

const mostrarPrecio = () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const plan = document.getElementById('plan').value;
    if (id && precios[id]) {
        const precioBase = precios[id];
        const precioFinal = Math.round(calcularPrecio(precioBase, plan)); 
        document.getElementById('detalleBoleto').innerText = `El precio del boleto es $${precioFinal}`;
    } else {
        document.getElementById('detalleBoleto').innerText = 'ID de producto no válido';
    }
};

document.getElementById('plan').addEventListener('change', mostrarPrecio);
window.onload = mostrarPrecio;
