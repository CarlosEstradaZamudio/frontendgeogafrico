// js/layers-config.js

function getMarginacionColor(grado) {
    // ... (misma función de color que antes)
    switch (grado) {
        case 'Muy alto': return '#800026';
        case 'Alto':     return '#BD0026';
        case 'Medio':    return '#E31A1C';
        case 'Bajo':     return '#FC4E2A';
        case 'Muy bajo': return '#FD8D3C';
        default:         return '#FFEDA0';
    }
}

export const layersConfig = [
    // Capa 1: Municipios (Capa simple)
    {
        id: 'capa_municipios',
        controlId: 'grupo_municipios', // <-- Coincide con el ID del checkbox en el HTML
        name: 'Municipios',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Amunicipios&outputFormat=application%2Fjson&srsName=EPSG:4326',
        style: { color: '#007bff', weight: 1.5, fillColor: '#5a99e2', fillOpacity: 0.4 },
        popup: (feature) => `<h3>${feature.properties.NOMGEO}</h3>`
    },

    {
        id: 'capa_marginacion',
        controlId: 'marginacion', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Grado de Marginación',
        url: 'http://127.0.0.1:8000/api/marginacion/',
        style: (feature) => ({
            fillColor: getMarginacionColor(feature.properties.gm_2020),
            weight: 1, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7,
        }),
        popup: (feature) => `<h4>${feature.properties.colonia}</h4><b>Grado de Marginación:</b> ${feature.properties.gm_2020}`
    },
    
    {
        id: 'capa_ayudantias',
        controlId: 'ayudantias', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Ayudantías',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Aayudantias&outputFormat=application%2Fjson&srsName=EPSG:4326',
        isPoint: true,
        pointStyle: { radius: 6, fillColor: "#ff7800", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8 },
        popup: (feature) => `<h4>${feature.properties.nombre_de_la_ayudantia || 'Ayudantía'}</h4>`
    },

    {
        id: 'capa_hospitales',
        controlId: 'hospitales', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Hospitales',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Ahospitales&outputFormat=application%2Fjson&srsName=EPSG:4326',
        isPoint: true,
        pointStyle: { radius: 6, fillColor: "#0091ffff", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8 }
    },

    {
        id: 'capa_semaforos',
        controlId: 'semaforos', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Semaforos',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Asemaforos&outputFormat=application%2Fjson&srsName=EPSG:4326',
        isPoint: true,
        pointStyle: { radius: 3, fillColor: "#d41e1eff", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8 }
    },

    {
        id: 'capa_tiradero',
        controlId: 'tiradero_municipaL', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Tiradero_municipal',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Atiradero_municipal&outputFormat=application%2Fjson&srsName=EPSG:4326',
        style: {
        color: '#000000ff',       // Color del borde (stroke)
        weight: 2,              // Grosor del borde en píxeles
        opacity: 1,             // Opacidad del borde (de 0 a 1)
        fillColor: '#000000ff',   // Color del relleno (fill)
        fillOpacity: 0.6        // Opacidad del relleno (de 0 a 1)
    },
    },

    {
        id: 'capa_vialidades',
        controlId: 'vialidades', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'Vialidades',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Avialidades&outputFormat=application%2Fjson&srsName=EPSG:4326',
        style: {
        color: '#3388ff',       // Color de la línea
        weight: 6,              // Grosor de la línea en píxeles
        opacity: 0.9,           // Opacidad de la línea (de 0 a 1)
        },
        popup: (feature) => `<h4>${feature.properties.NOMVIAL}</h4>`
    },

    {
        id: 'capa_unidadesdeportivas',
        controlId: 'unidades_deportivas', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'unidades_deportivas',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Aunidadesdeportivas&outputFormat=application%2Fjson&srsName=EPSG:4326',
        isPoint: true,
        pointStyle: { radius: 3, fillColor: "#000000ff", color: "#000000ff", weight: 4, opacity: 1, fillOpacity: 0.8 }
    },

    {
        id: 'capa_cicloviasprimarias',
        controlId: 'cicloviasprimarias', // <-- Coincide con el ID del checkbox de la subcapa
        name: 'cicloviasprimarias',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Acicloviasprimarias&outputFormat=application%2Fjson&srsName=EPSG:4326',
        style: {
        color: '#1ac268ff',       // Color de la línea
        weight: 4,              // Grosor de la línea en píxeles
        opacity: 0.9,           // Opacidad de la línea (de 0 a 1)
        },
    }
];
