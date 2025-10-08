// ======================= INICIALIZACIÓN DEL MAPA =======================
var map = L.map("map", {
    zoomControl: false,
    minZoom: 3,
    maxZoom: 18,
    attributionControl: false
}).setView([18.8206, -98.93525], 13);

var base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: ""
}).addTo(map);

var satelital = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "" }
);

var topografico = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    { attribution: "" }
);

// Controles básicos
L.control.scale({ position: "bottomleft", maxWidth: 200, metric: true }).addTo(map);
L.control.zoom({ position: "topright" }).addTo(map);


// ======================= CARGA Y GESTIÓN DE CAPAS TEMÁTICAS =======================
// --- 1. VARIABLES PARA ALMACENAR LAS CAPAS ---
let capaMunicipios = null;
let capaMarginacion = null;
let capaAyudantias = null;

// --- 2. FUNCIÓN PARA ESTILO DE CAPA MARGINACIÓN (COROPLÉTICO) ---
function getColor(grado) {
    switch (grado) {
        case 'Muy alto': return '#800026';
        case 'Alto':     return '#BD0026';
        case 'Medio':    return '#E31A1C';
        case 'Bajo':     return '#FC4E2A';
        case 'Muy bajo': return '#FD8D3C';
        default:         return '#FFEDA0'; // Color para valores no esperados
    }
}

// --- 3. FUNCIONES PARA CARGAR DATOS DESDE LOS SERVIDORES ---
// Carga de la capa de MUNICIPIOS desde GeoServer (WFS)
function cargarCapaMunicipios() {
    // Asegúrate de que esta URL sea accesible desde donde ejecutas la página
    const geoServerUrl = "http://192.168.1.67:8080/geoserver/municipios/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=municipios:municipios&outputFormat=application/json&srsName=EPSG:4326";

    fetch(geoServerUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Error en GeoServer: ${response.status}`);
            return response.json();
        })
        .then(data => {
            capaMunicipios = L.geoJSON(data, {
                style: {
                    color: '#007bff',
                    weight: 1.5,
                    fillColor: '#5a99e2',
                    fillOpacity: 0.4,
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.nomgeo) {
                        layer.bindPopup(`<h3>${feature.properties.nomgeo}</h3>`);
                    }
                },
            });
            console.log("Capa de municipios cargada y lista.");
        })
        .catch(error => {
            console.error("Falló la petición a GeoServer:", error);
            // Opcional: alertar al usuario
            // alert("No se pudo cargar la capa de municipios. Revisa la consola para más detalles.");
        });
}

// Carga de la capa de MARGINACIÓN desde la API de Django
function cargarCapaMarginacion() {
    // Asegúrate de que tu servidor Django esté corriendo en esta dirección
    fetch("http://127.0.0.1:8000/api/marginacion/")
        .then(response => response.json())
        .then(data => {
            capaMarginacion = L.geoJSON(data, {
                style: function (feature) {
                    return {
                        fillColor: getColor(feature.properties.gm_2020),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7,
                    };
                },
                onEachFeature: function (feature, layer) {
                    const props = feature.properties;
                    layer.bindPopup(`<h4>${props.colonia}</h4><b>Grado de Marginación:</b> ${props.gm_2020}`);
                },
            });
            console.log("Capa de marginación cargada y lista.");
        })
        .catch(error => {
            console.error("Falló la petición a la API de Django:", error);
            // Opcional: alertar al usuario
            // alert("No se pudo cargar la capa de marginación. Revisa la consola para más detalles.");
        });
}

function cargarAyudantias() {
    
    const puntosUrl = "http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Aayudantias&outputFormat=application%2Fjson&srsName=EPSG:4326";

    fetch(puntosUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Error en el servidor de puntos: ${response.status}`);
            return response.json();
        })
        .then(data => {
            capaAyudantias = L.geoJSON(data, {
                // Esta es la opción clave para puntos
                pointToLayer: function (feature, latlng) {
                    // Usamos L.circleMarker para tener control total del estilo
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "#ff7800", // Naranja
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            });
            console.log("Capa de puntos de interés cargada y lista.");
        })
        .catch(error => {
            console.error("Falló la petición de la capa de puntos:", error);
        });
}

// --- 4. INICIAR LA CARGA DE DATOS AL CARGAR LA PÁGINA ---
cargarCapaMunicipios();
cargarCapaMarginacion();
cargarAyudantias();


// ======================= EVENTOS DOM =======================
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. TOGGLE DEL SIDEBAR ---
    const sidebar = document.getElementById("sidebar");
    const mainContainer = document.querySelector(".main-contenido");
    const toggleSidebarButton = document.getElementById("toggle-sidebar");
    const icon = toggleSidebarButton.querySelector("i");

    toggleSidebarButton.addEventListener("click", () => {
        sidebar.classList.toggle("oculto");
        mainContainer.classList.toggle("sidebar-open");

        if (mainContainer.classList.contains("sidebar-open")) {
            icon.classList.remove("fa-chevron-right");
            icon.classList.add("fa-chevron-left");
        } else {
            icon.classList.remove("fa-chevron-left");
            icon.classList.add("fa-chevron-right");
        }
        // IMPORTANTE: Ajustar el tamaño del mapa después de la animación del sidebar
        setTimeout(() => map.invalidateSize(), 300);
    });

    // --- 2. CAMBIO DE CAPAS BASE ---
    document.getElementById("mapa-base").addEventListener("click", () => {
        map.removeLayer(satelital);
        map.removeLayer(topografico);
        map.addLayer(base);
    });

    document.getElementById("mapa-satelital").addEventListener("click", () => {
        map.removeLayer(base);
        map.removeLayer(topografico);
        map.addLayer(satelital);
    });

    document.getElementById("mapa-topografico").addEventListener("click", () => {
        map.removeLayer(base);
        map.removeLayer(satelital);
        map.addLayer(topografico);
    });

    // --- 3. CONTROLES PERSONALIZADOS DEL MAPA ---
    const mapControlsContainer = document.getElementById("mapControls");
    const triggerButton = mapControlsContainer.querySelector(".map-controls-trigger");
    const mapStyleButtons = mapControlsContainer.querySelectorAll(".map-style-button");

    triggerButton.addEventListener("click", (event) => {
        event.stopPropagation();
        mapControlsContainer.classList.toggle("is-open");
    });

    document.addEventListener("click", (event) => {
        if (mapControlsContainer.classList.contains("is-open") &&
            !mapControlsContainer.contains(event.target)) {
            mapControlsContainer.classList.remove("is-open");
        }
    });

    mapStyleButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            mapStyleButtons.forEach(btn => btn.classList.remove("active"));
            const clickedButton = event.currentTarget;
            clickedButton.classList.add("active");
            console.log("Cambiando al mapa: " + clickedButton.id);
        });
    });

    // --- 4. LISTA DE CAPAS INTERACTIVA ---
    
    // **AÑADIDO**: Conexión de checkboxes con la lógica de capas
    const checkMunicipios = document.getElementById("grupo_municipios");
    const checkMarginacion = document.getElementById("grupo_equipamiento");
    const checkAyudantias = document.getElementById("grupo_infraestructura");
    
    // **OPCIONAL**: Cambiar etiquetas para que sean más descriptivas
    document.querySelector('label[for="grupo_municipios"]').textContent = "Municipios";
    document.querySelector('label[for="grupo_equipamiento"]').textContent = "Grado de Marginación";
    document.querySelector('label[for="grupo_infraestructura"]').textContent = "Ayudantias";

    
    checkMunicipios.addEventListener('change', function() {
        if(this.checked) {
            if (capaMunicipios) capaMunicipios.addTo(map);
            else alert("La capa de municipios aún está cargando...");
        } else {
            if (capaMunicipios) map.removeLayer(capaMunicipios);
        }
    });

    checkMarginacion.addEventListener('change', function() {
        if(this.checked) {
            if (capaMarginacion) capaMarginacion.addTo(map);
            else alert("La capa de marginación aún está cargando...");
        } else {
            if (capaMarginacion) map.removeLayer(capaMarginacion);
        }
    });

    checkAyudantias.addEventListener('change', function() {
        if(this.checked) {
            if (capaAyudantias) capaAyudantias.addTo(map);
            else alert("La capa de ayudantias aún está cargando...");
        } else {
            if (capaAyudantias) map.removeLayer(capaAyudantias);
        }
    });


    const toggleButtons = document.querySelectorAll(".toggle-sublayers");
    toggleButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const layerGroup = button.closest(".layer-group");
            layerGroup.classList.toggle("is-open");
        });
    });

    const layerGroups = document.querySelectorAll(".layer-group");
    layerGroups.forEach(group => {
        const parentCheckbox = group.querySelector(".parent-checkbox");
        const childCheckboxes = group.querySelectorAll(".child-checkbox");

        if (parentCheckbox) {
            parentCheckbox.addEventListener("change", () => {
                // Si la capa es de las que cargamos, no propagar a hijos inexistentes
                if (parentCheckbox.id === 'grupo_equipamiento' || parentCheckbox.id === 'grupo_infraestructura') {
                    const sublist = group.querySelector('.sublayer-list');
                    return;
                }
                childCheckboxes.forEach(child => {
                    child.checked = parentCheckbox.checked;
                });
            });
        }

        childCheckboxes.forEach(child => {
            child.addEventListener("change", () => {
                const totalChildren = childCheckboxes.length;
                const checkedChildren = group.querySelectorAll(".child-checkbox:checked").length;

                if (checkedChildren === 0) {
                    parentCheckbox.checked = false;
                    parentCheckbox.indeterminate = false;
                } else if (checkedChildren === totalChildren) {
                    parentCheckbox.checked = true;
                    parentCheckbox.indeterminate = false;
                } else {
                    parentCheckbox.checked = false;
                    parentCheckbox.indeterminate = true;
                }
            });
        });
    });
});


// ======================= GEOMAN =======================
// ... (Tu código de Geoman y Medición permanece exactamente igual aquí abajo) ...

// Botón de inicio
const goHomeOptions = {
    name: "goHome",
    block: "draw",
    title: "Ir a la ubicación inicial",
    className: "control-icon-home",
    onClick: () => {
        map.setView([18.8206, -98.93525], 14);
    },
};
map.pm.Toolbar.createCustomControl(goHomeOptions);

// Icono personalizado
const myCustomIcon = L.icon({
    iconUrl: "img/logo_pequeño2.png",
    iconSize: [30, 30],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

// Configuración Geoman
map.pm.setGlobalOptions({
    pathOptions: { color: "#00653e", fillColor: "#00653e", fillOpacity: 0.4 },
    templineStyle: { color: "#00653e", weight: 5 },
    hintlineStyle: { color: "#00653e", weight: 5, dashArray: "5, 5" },
    hintMarkerStyle: { radius: 6, color: "#333", fillColor: "orange", fillOpacity: 1, weight: 2 }
});

map.pm.addControls({
    position: "topright",
    drawMarker: true,
    drawPolyline: true,
    drawRectangle: true,
    drawPolygon: true,
    drawCircle: true,
    drawCircleMarker: false,
    drawText: true,
    editMode: true,
    dragMode: true,
    cutPolygon: true,
    rotateMode: true,
});

// Cambiar icono de marcador
map.on("pm:create", (e) => {
    if (e.shape === "Marker") e.layer.setIcon(myCustomIcon);
});
map.on("pm:drawstart", ({ shape, workingLayer }) => {
    if (shape === "Marker") workingLayer.setIcon(myCustomIcon);
});

// Estilos generales
map.pm.setPathOptions({ color: "#00653e", fillColor: "#00653e", fillOpacity: 0.4, weight: 4 });
map.pm.setLang("es");


// ======================= FUNCIONES DE MEDICIÓN =======================
let drawingLayer = null, measureTooltip = null, drawingShape = "";

function updatePopup(layer) {
    const shape = layer.pm.getShape();
    let popupContent = "";

    if (shape === "Line") {
        const distance = L.GeometryUtil.length(layer.getLatLngs());
        popupContent = `<b>Distancia:</b> ${(distance / 1000).toFixed(2)} km`;
    } else if (shape === "Circle") {
        const radius = layer.getRadius();
        const area = Math.PI * Math.pow(radius, 2);
        const circumference = 2 * Math.PI * radius;
        popupContent = `<b>Área:</b> ${(area / 1000000).toFixed(2)} km²<br><b>Perímetro:</b> ${(circumference / 1000).toFixed(2)} km`;
    } else if (shape === "Polygon" || shape === "Rectangle") {
        const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
        popupContent = `<b>Área:</b> ${(area / 1000000).toFixed(2)} km²`;
    }

    if (!layer.getPopup()) layer.bindPopup(popupContent);
    else layer.setPopupContent(popupContent);
}

function updateTooltip(e) {
    if (!drawingLayer) return;
    let content = "Haz clic para continuar";
    const latlngs = drawingLayer.getLatLngs();

    if (drawingShape === "Line") {
        const tempLatLngs = [...latlngs, e.latlng];
        if (tempLatLngs.length > 1) {
            const distance = L.GeometryUtil.length(tempLatLngs);
            content = `<b>Distancia:</b> ${(distance / 1000).toFixed(2)} km`;
        }
    } else if (drawingShape === "Polygon" || drawingShape === "Rectangle") {
        const tempLatLngs = latlngs[0] ? [...latlngs[0], e.latlng] : [e.latlng];
        if (tempLatLngs.length > 2) {
            const area = L.GeometryUtil.geodesicArea(tempLatLngs);
            content = `<b>Área:</b> ${(area / 1000000).toFixed(2)} km²`;
        }
    } else if (drawingShape === "Circle") {
        const center = drawingLayer.getLatLng();
        const radius = center.distanceTo(e.latlng);
        const area = Math.PI * Math.pow(radius, 2);
        content = `<b>Radio:</b> ${(radius / 1000).toFixed(2)} km<br><b>Área:</b> ${(area / 1000000).toFixed(2)} km²`;
    }

    if (measureTooltip) measureTooltip.setLatLng(e.latlng).setContent(content);
}

// Eventos Geoman para medición
map.on("pm:drawstart", (e) => {
    drawingShape = e.shape;
    drawingLayer = e.workingLayer;
    measureTooltip = L.tooltip({ sticky: true }).addTo(map);
    map.on("mousemove", updateTooltip);
});

map.on('pm:create', function(e) {
  map.off('mousemove', updateTooltip);
  if (measureTooltip) measureTooltip.remove();
  drawingLayer = null;
  drawingShape = '';
  measureTooltip = null;

  map.pm.disableDraw();

  const finalLayer = e.layer;

  if (e.shape !== 'Marker') {
    updatePopup(finalLayer);
    finalLayer.on('mouseover', () => finalLayer.openPopup());
    finalLayer.on('mouseout', () => finalLayer.closePopup());
    finalLayer.on('pm:edit', (ev) => updatePopup(ev.layer));
  }
});