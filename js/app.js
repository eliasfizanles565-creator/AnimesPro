document.addEventListener("DOMContentLoaded", () => {

   

    // ==========================================

    // 1. DESPLEGAR TEMPORADAS DESDE LAS MINIATURAS

    // ==========================================

    const tarjetas = document.querySelectorAll(".btn-abrir-seccion");

    tarjetas.forEach(tarjeta => {

        tarjeta.addEventListener("click", () => {
            const objetivoId = tarjeta.getAttribute("data-target");
            const seccionTarget = document.getElementById(objetivoId);

            if (seccionTarget) {

                seccionTarget.classList.remove("hidden");
                seccionTarget.scrollIntoView({ behavior: "smooth" });
            }
        });
    });



    // ==========================================

    // 2. CAMBIAR VIDEOS EN CUALQUIER TEMPORADA (REPARADO PARA PC)

    // ==========================================

    const botonesEpisodio = document.querySelectorAll(".btn-episodio");



    botonesEpisodio.forEach(boton => {

        boton.addEventListener("click", () => {
            const nuevoVideo = boton.getAttribute("data-video");

           

            if (nuevoVideo && nuevoVideo.trim() !== "") {
                const seccionActual = boton.closest("section[id^='seccion-']");

                // Buscamos DIRECTAMENTE el iframe que ya existe en tu HTML

                const iframeExistente = seccionActual.querySelector("#reproductor-principal");

                if (iframeExistente) {

                    // Cambiamos solo el atributo src. Esto mantiene el foco perfecto en PC

                    iframeExistente.src = nuevoVideo;
                } else {

                    // Por si acaso no existiera (primera carga), lo buscamos por contenedor

                    const contenedorVideo = seccionActual.querySelector("[id^='contenedor-reproductor']");

                    if (contenedorVideo) {
                        contenedorVideo.innerHTML = `

                            <iframe
                                id="reproductor-principal"
                                src="${nuevoVideo}"
                                class="w-full h-full absolute inset-0"
                                frameborder="0"
                                allowfullscreen>
                            </iframe>
                        `;
                    }
                }
            }
        });
    });



    // ==========================================

    // 3. CERRAR SECCIÓN AL DAR CLIC EN EL FONDO VACÍO (Y APAGAR VIDEO)

    // ==========================================

    const seccionesReproductores = document.querySelectorAll("section[id^='seccion-']");

    seccionesReproductores.forEach(seccion => {

        seccion.addEventListener("click", (event) => {
            const cajaInterna = seccion.querySelector('section') || seccion.querySelector('div');

            const esBotonEpisodio = event.target.closest('.btn-episodio');


            // Si es un botón de episodio, no hace nada

            if (esBotonEpisodio) return;

            // Si le da clic al icono pequeño de cerrar, oculta la sección y apaga el video

            // =========================================================================


            // Buscamos si el usuario hizo clic en tu icono de Remix Icon

            const esIconoCerrar = event.target.closest('.ri-remix-fill');

            if (esIconoCerrar) {

                // Busca el iframe y limpia su contenido para que no siga sonando

                const reproductor = seccion.querySelector("#reproductor-principal");
                if (reproductor) {

                    reproductor.src = "about:blank"; // Esto destruye el video al cerrar
                }

                seccion.classList.add("hidden"); // Oculta la sección
            }
        });
    });
});







// /////////////////////////////////////////////////



// ====== POSICIONAR SCROLL DE SECTIONS =========

let isScrolling;

window.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);



    isScrolling = setTimeout(() => {
        const secciones = document.querySelectorAll('.seccion-snap');

        const altoPantalla = window.innerHeight;
        const puntoDeCorte = 200;

        secciones.forEach((seccion) => {
            const rect = seccion.getBoundingClientRect();


            if (rect.bottom < altoPantalla + puntoDeCorte && rect.bottom > altoPantalla - puntoDeCorte) {
                if (Math.abs(rect.bottom - altoPantalla) > 5) {

                    window.scrollBy({
                        top: rect.bottom - altoPantalla,
                        behavior: 'smooth'
                    });
                }
            }

            else if (rect.top < puntoDeCorte && rect.top > -puntoDeCorte) {
                if (Math.abs(rect.top) > 5) {

                    window.scrollBy({
                        top: rect.top,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }, 100);
}, { passive: true });





// ==== SUBIR BOTON DE EPISODIO =====

// Seleccionamos todos tus botones de episodios

  const botones = document.querySelectorAll('.botonsitos');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {

      // (Opcional) Si quieres que solo un botón esté subido a la vez, desactiva los demás:
      botones.forEach(b => b.classList.remove('subido'));

      // Activa el botón actual
      boton.classList.add('subido');
    });

  });
////////////////////////////////////////////////////




//////////////////////////////////////////////////////



///////////////////////////////////////////////////