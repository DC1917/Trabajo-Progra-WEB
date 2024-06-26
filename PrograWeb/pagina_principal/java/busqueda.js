function buscar() {
    var query = document.getElementById('searchInput').value.toLowerCase();
    var items = document.getElementsByClassName('item');

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var contenido = item.textContent.toLowerCase();

        if (contenido.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    }
}
