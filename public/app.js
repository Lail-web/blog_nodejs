// ============================================
// CONFIGURACIÓN
// ============================================
const API = {
    listar:     '/api/listar',
    crear:      '/api/crear',
    uno:        (id) => `/api/articulo/${id}`,
    actualizar: (id) => `/api/actualizar/${id}`,
    borrar:     (id) => `/api/borrar/${id}`,
};
const UPLOADS = '/uploads';

const lista    = document.getElementById('lista-articulos');
const form     = document.getElementById('form-articulo');
const msg      = document.getElementById('mensaje');

// ============================================
// UTILIDADES
// ============================================
function urlImagen(imgUrl) {
    if (!imgUrl || imgUrl === 'default.png') {
        return 'https://via.placeholder.com/400x200?text=Sin+imagen';
    }
    return `${UPLOADS}/${imgUrl}`;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// ============================================
// LISTAR ARTÍCULOS
// ============================================
async function cargarArticulos() {
    lista.innerHTML = '<p class="loading">Cargando artículos...</p>';
    try {
        const res = await fetch(API.listar);

        // Si no hay artículos el backend responde 404
        if (res.status === 404) {
            lista.innerHTML = '<p class="loading">Aún no hay artículos. ¡Crea el primero!</p>';
            return;
        }
        if (!res.ok) throw new Error('Error al cargar los artículos');

        const data = await res.json();
        const articulos = data.articulos || [];

        if (articulos.length === 0) {
            lista.innerHTML = '<p class="loading">Aún no hay artículos. ¡Crea el primero!</p>';
            return;
        }

        lista.innerHTML = articulos.map(a => `
            <article class="card" data-id="${a._id}">
                <img class="card__img"
                     src="${urlImagen(a.imgUrl)}"
                     alt="${a.titulo}"
                     onerror="this.src='https://via.placeholder.com/400x200?text=Sin+imagen'">
                <div class="card__body">
                    <h3 class="card__title">${a.titulo}</h3>
                    <p class="card__date">${formatearFecha(a.fecha)}</p>
                    <p class="card__content">${a.contenido}</p>
                    <div class="card__actions">
                        <button class="btn btn--sm btn--edit" data-accion="editar" data-id="${a._id}">✏️ Editar</button>
                        <button class="btn btn--sm btn--delete" data-accion="borrar" data-id="${a._id}">🗑️ Borrar</button>
                    </div>
                </div>
            </article>
        `).join('');

    } catch (err) {
        lista.innerHTML = `<p class="loading">Error: ${err.message}</p>`;
    }
}

// ============================================
// CREAR ARTÍCULO (form-data porque lleva imagen)
// ============================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Publicando...';
    msg.className = 'mensaje';

    try {
        const formData = new FormData(form);

        const res = await fetch(API.crear, {
            method: 'POST',
            body: formData    // ⚠️ NO pongas Content-Type, el navegador lo pone solo
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || data.error || 'No se pudo crear el artículo');
        }

        msg.textContent = '✅ Artículo publicado con éxito';
        msg.className = 'mensaje mensaje--ok';
        form.reset();
        cargarArticulos();

        setTimeout(() => { msg.textContent = ''; }, 3000);

    } catch (err) {
        msg.textContent = `❌ ${err.message}`;
        msg.className = 'mensaje mensaje--error';
    }
});

// ============================================
// EDITAR / BORRAR  (delegación de eventos)
// ============================================
lista.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;

    const id = btn.dataset.id;
    const accion = btn.dataset.accion;

    if (accion === 'borrar') {
        if (!confirm('¿Seguro que quieres borrar este artículo?')) return;
        try {
            const res = await fetch(API.borrar(id), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje || 'Error al borrar');
            cargarArticulos();
        } catch (err) {
            alert('❌ ' + err.message);
        }
    }

    if (accion === 'editar') {
        // Cargar el artículo para editar
        try {
            const res = await fetch(API.uno(id));
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensaje || 'Error al buscar');

            const a = data.articulo;
            const nuevoTitulo = prompt('Nuevo título:', a.titulo);
            if (nuevoTitulo === null) return;
            const nuevoContenido = prompt('Nuevo contenido:', a.contenido);
            if (nuevoContenido === null) return;

            // PUT también con form-data (por si algún día mandas imagen nueva)
            const fd = new FormData();
            fd.append('titulo', nuevoTitulo);
            fd.append('contenido', nuevoContenido);

            const res2 = await fetch(API.actualizar(id), {
                method: 'PUT',
                body: fd
            });
            const data2 = await res2.json();
            if (!res2.ok) throw new Error(data2.mensaje || 'Error al actualizar');
            cargarArticulos();
        } catch (err) {
            alert('❌ ' + err.message);
        }
    }
});

// ============================================
// INICIALIZAR
// ============================================
cargarArticulos();