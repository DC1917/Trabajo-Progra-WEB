document.getElementById('formulario-boleto').addEventListener('submit', function(event) {
const selectedDate = new Date(document.getElementById('fecha').value);
const currentDate = new Date();
            
if (selectedDate < currentDate) {
    event.preventDefault();
    alert('Por favor, selecciona una fecha valida, la fecha que ingresaste ya pasó.');
}
});
