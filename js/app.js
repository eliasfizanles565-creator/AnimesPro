document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // FUNCIÓN AUXILIAR PARA APAGAR VIDEOS Y LIMPIAR CUOTA
    // ==========================================
    function apagarTodosLosVideos() {
        const todosLosVideos = document.querySelectorAll("video");
        todosLosVideos.forEach(video => {
            video.pause();
            video.src = "";
            video.load();
            
            const nuevoIframe = document.createElement("iframe");
            nuevoIframe.id = "reproductor-principal";
            nuevoIframe.src = "";
            nuevoIframe.className = "w-full h-full absolute inset-0 z-20";
            nuevoIframe.setAttribute("frameborder", "0");
            nuevoIframe.setAttribute("allowfullscreen", "");
            
            video.parentNode.replaceChild(nuevoIframe, video);
        });
    }

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
    // 2. CAMBIAR VIDEOS EN CUALQUIER TEMPORADA (CORREGIDO DE FONDO)
    // ==========================================
    const botonesEpisodio = document.querySelectorAll(".btn-episodio");

    botonesEpisodio.forEach(boton => {
        boton.addEventListener("click", () => {
            const nuevoVideo = boton.getAttribute("data-video");

            if (nuevoVideo && nuevoVideo.trim() !== "") {
                const seccionActual = boton.closest("section[id^='seccion-']");
                const iframeExistente = seccionActual.querySelector("#reproductor-principal");

                // 1. Si el enlace es de Google Drive, hacemos la conversión al reproductor nativo
                if (nuevoVideo.includes("drive.google.com")) {
                    const match = nuevoVideo.match(/\/d\/([^/]+)/);
                    
                    if (match && match[1]) {
                        const fileId = match[1];
                        
                        // Buscamos si ya se transformó a elemento de video previamente
                        const videoExistente = seccionActual.querySelector("video");

                        if (videoExistente) {
                            // CORRECCIÓN: Si ya hay un video sonando, lo pausamos y vaciamos antes de meter el nuevo para matar el audio fantasma
                            videoExistente.pause();
                            videoExistente.src = `http://localhost:3000/stream/${fileId}`;
                            videoExistente.load();
                            videoExistente.play();
                        } else if (iframeExistente) {
                            // Si todavía es el iframe inicial, creamos el reproductor nativo
                            const videoElement = document.createElement("video");
                            videoElement.controls = true;
                            videoElement.className = "w-full h-full absolute inset-0 z-20";
                            videoElement.style.backgroundColor = "black";
                            videoElement.autoplay = true; 
                            videoElement.preload = "metadata";

                            const sourceElement = document.createElement("source");
                            sourceElement.src = `http://localhost:3000/stream/${fileId}`;
                            sourceElement.type = "video/mp4";
                            videoElement.appendChild(sourceElement);

                            iframeExistente.parentNode.replaceChild(videoElement, iframeExistente);
                        }
                    }
                } else {
                    // 2. Si el video NO es de Drive (los que pesan menos de 100mb de tu PC)
                    const videoExistente = seccionActual.querySelector("video");
                    
                    if (videoExistente) {
                        videoExistente.pause(); // Apagamos el video nativo antes de devolver el iframe
                        const nuevoIframe = document.createElement("iframe");
                        nuevoIframe.id = "reproductor-principal";
                        nuevoIframe.src = nuevoVideo;
                        nuevoIframe.className = "w-full h-full absolute inset-0 z-20";
                        nuevoIframe.setAttribute("frameborder", "0");
                        nuevoIframe.setAttribute("allowfullscreen", "");
                        
                        videoExistente.parentNode.replaceChild(nuevoIframe, videoExistente);
                    } else if (iframeExistente) {
                        iframeExistente.src = nuevoVideo;
                    }
                }
            }
        });
    });

    // ==========================================
    // 3. CERRAR SECCIÓN AL DAR CLIC EN EL FONDO VACÍO (CORREGIDO PARA CORTAR AUDIO)
    // ==========================================
    const seccionesReproductores = document.querySelectorAll("section[id^='seccion-']");

    seccionesReproductores.forEach(seccion => {
        seccion.addEventListener("click", (event) => {
            const esBotonEpisodio = event.target.closest('.btn-episodio');

            if (esBotonEpisodio) return;

            const esIconoCerrar = event.target.closest('.ri-remix-fill');

            if (esIconoCerrar) {
                // CORRECCIÓN: Buscamos si el reproductor actual es un <video> nativo
                const videoElement = seccion.querySelector("video");
                
                if (videoElement) {
                    // Si es un video, lo matamos de forma limpia usando nuestra función auxiliar
                    apagarTodosLosVideos();
                } else {
                    // Si sigue siendo un iframe original, usamos tu método tradicional
                    const reproductor = seccion.querySelector("#reproductor-principal");
                    if (reproductor) {
                        reproductor.src = "about:blank";
                    }
                }
                seccion.classList.add("hidden");
            }
        });
    });
});

// ==========================================
// 4. CERRAR MENÚ SÁNDWICH AL CLICAR FUERA
// ==========================================
const checkboxMenu = document.getElementById("menu-toggle");
const contenedorSandwich = checkboxMenu ? checkboxMenu.parentElement : null;

if (checkboxMenu && contenedorSandwich) {
    document.addEventListener("click", (event) => {
        if (checkboxMenu.checked) {
            if (!contenedorSandwich.contains(event.target)) {
                checkboxMenu.checked = false;
            }
        }
    });
}

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
const botones = document.querySelectorAll('.botonsitos');
botones.forEach(boton => {
    boton.addEventListener('click', () => {
        botones.forEach(b => b.classList.remove('subido'));
        boton.classList.add('subido');
    });
});

// ====== ZENITH STREAMING INTERACTIONS ======
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menuLinks = document.querySelectorAll("#menu-toggle ~ div a");

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (menuToggle) menuToggle.checked = false;
        });
    });

    document.querySelectorAll(".btn-abrir-seccion").forEach((card) => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const title = card.querySelector("h2")?.textContent?.trim();
        if (title) card.setAttribute("aria-label", `Abrir ${title}`);

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                card.click();
            }
        });
    });

    document.querySelectorAll(".btn-episodio").forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.closest("section[id^='seccion-']");
            section?.querySelectorAll(".btn-episodio").forEach((item) => {
                item.classList.remove("is-playing");
                item.removeAttribute("aria-current");
            });

            button.classList.add("is-playing");
            button.setAttribute("aria-current", "true");
        });
    });

    const navLinks = document.querySelectorAll("nav a[href^='#']");
    const sectionIds = [...navLinks]
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.length > 1)
        .map((href) => href.slice(1));

    const visibleSections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const activateNav = () => {
        let currentId = visibleSections[0]?.id;

        visibleSections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * .45 && rect.bottom >= window.innerHeight * .45) {
                currentId = section.id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
        });
    };

    activateNav();
    window.addEventListener("scroll", activateNav, { passive: true });
});

// =================================================================
// REEMPLAZO AUTOMÁTICO AL CARGAR (MANTENIDO PARA COMPATIBILIDAD)
// =================================================================
document.addEventListener("DOMContentLoaded", function () {
    const iframes = document.querySelectorAll("iframe");

    iframes.forEach(iframe => {
        const src = iframe.src;

        if (src.includes("drive.google.com")) {
            const match = src.match(/\/d\/([^/]+)/);
            
            if (match && match[1]) {
                const fileId = match[1];

                const videoElement = document.createElement("video");
                videoElement.controls = true;
                videoElement.width = 360;  
                videoElement.height = 215; 
                videoElement.style.borderRadius = "8px"; 
                videoElement.style.margin = "10px";
                videoElement.preload = "metadata";

                const sourceElement = document.createElement("source");
                sourceElement.src = `http://localhost:3000/stream/${fileId}`;
                sourceElement.type = "video/mp4";

                videoElement.appendChild(sourceElement);
                iframe.parentNode.replaceChild(videoElement, iframe);
            }
        }
    });
});