// js/map-manager.js

const loadedLayers = {}; 
let map;

export function initializeMap() {
    map = L.map("map", {
        zoomControl: false,
        minZoom: 3,
        maxZoom: 18,
        attributionControl: true
    }).setView([18.8206, -98.93525], 13);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' + 
                     ' | &copy; 2025 IMPLAN Cuautla'
    }).addTo(map);
    
    // 1. OpenStreetMap
    const base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' +
                 ' | &copy; 2025 IMPLAN Cuautla'
    });

// 2. Esri Satelital
    const satelital = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' +
                 ' | &copy; 2025 IMPLAN Cuautla'
    });

// 3. Esri Topográfico
    const topografico = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' +
                 ' | &copy; 2025 IMPLAN Cuautla'
    });

    
    L.control.scale({ position: "bottomleft", maxWidth: 200, metric: true }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);

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
    rotateMode: false,
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

    return { map, base, satelital, topografico };
}

async function createLayer(layerConfig) {
    if (loadedLayers[layerConfig.id]) {
        return loadedLayers[layerConfig.id];
    }
    try {
        const response = await fetch(layerConfig.url);
        if (!response.ok) throw new Error(`Error de red: ${response.status}`);
        const data = await response.json();

        const layerOptions = {
            style: layerConfig.style,
            onEachFeature: (feature, layer) => {
                if (layerConfig.popup) layer.bindPopup(layerConfig.popup(feature));
            }
        };

        if (layerConfig.isPoint) {
            layerOptions.pointToLayer = (feature, latlng) => L.circleMarker(latlng, layerConfig.pointStyle);
        }

        const geoJsonLayer = L.geoJSON(data, layerOptions);
        loadedLayers[layerConfig.id] = geoJsonLayer;
        return geoJsonLayer;
    } catch (error) {
        console.error(`Falló la carga de la capa "${layerConfig.name}":`, error);
        alert(`No se pudo cargar la capa: ${layerConfig.name}`);
        return null;
    }
}

export async function toggleLayer(layerConfig, show, mapInstance) {
    if (show) {
        const layer = await createLayer(layerConfig);
        if (layer && !mapInstance.hasLayer(layer)) {
            layer.addTo(mapInstance);
        }
    } else {
        const layer = loadedLayers[layerConfig.id];
        if (layer && mapInstance.hasLayer(layer)) {
            mapInstance.removeLayer(layer);
        }
    }
}