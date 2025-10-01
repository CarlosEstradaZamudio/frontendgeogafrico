// ======================= INICIALIZACIÓN DEL MAPA =======================
var map = L.map("map", {
    zoomControl: false,
    minZoom: 3,
    maxZoom: 18,
    attributionControl: false
}).setView([18.8206, -98.93525], 14);

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

