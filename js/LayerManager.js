import { LAYERS_CONFIG } from './layersConfig.js';

// Función auxiliar para el estilo de la capa de marginación
function getColor(grado) {
    switch (grado) {
        case 'Muy alto': return '#800026';
        case 'Alto': return '#BD0026';
        case 'Medio': return '#E31A1C';
        case 'Bajo': return '#FC4E2A';
        case 'Muy bajo': return '#FD8D3C';
        default: return '#FFEDA0';
    }
}

export class LayerManager {
    constructor(map) {
        this.map = map;
        this.config = LAYERS_CONFIG;
        this.activeLayers = {};
    }

    async loadLayer(id) {
        if (this.activeLayers[id]) return this.activeLayers[id];

        const layerConfig = this.config.find(layer => layer.id === id);
        if (!layerConfig) return null;

        try {
            const response = await fetch(layerConfig.url);
            if (!response.ok) throw new Error(`Falló la carga para ${layerConfig.name}`);
            const data = await response.json();

            let leafletLayer;
            switch (layerConfig.type) {
                case 'wfs-polygon':
                    leafletLayer = L.geoJSON(data, { style: layerConfig.style });
                    break;
                case 'wfs-point':
                    leafletLayer = L.geoJSON(data, {
                        pointToLayer: (feature, latlng) => L.circleMarker(latlng, layerConfig.style)
                    });
                    break;
                case 'api-choropleth':
                    leafletLayer = L.geoJSON(data, {
                        style: (feature) => ({
                            fillColor: getColor(feature.properties.gm_2020),
                            weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7
                        })
                    });
                    break;
            }

            leafletLayer.eachLayer(layer => {
                const props = layer.feature.properties;
                if (layerConfig.popupFunction) {
                    layer.bindPopup(layerConfig.popupFunction(props));
                } else if (layerConfig.popupProperty && props[layerConfig.popupProperty]) {
                    layer.bindPopup(`<h4>${props[layerConfig.popupProperty]}</h4>`);
                }
            });

            this.activeLayers[id] = leafletLayer;
            console.log(`Capa '${layerConfig.name}' cargada.`);
            return leafletLayer;
        } catch (error) {
            console.error(error);
            alert(`No se pudo cargar la capa: ${layerConfig.name}`);
            return null;
        }
    }

    async showLayer(id) {
        const layer = await this.loadLayer(id);
        if (layer && !this.map.hasLayer(layer)) layer.addTo(this.map);
    }

    hideLayer(id) {
        const layer = this.activeLayers[id];
        if (layer && this.map.hasLayer(layer)) this.map.removeLayer(layer);
    }
}