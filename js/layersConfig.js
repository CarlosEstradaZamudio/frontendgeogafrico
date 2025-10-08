export const LAYERS_CONFIG = [
    {
        id: 'grupo_planeacion', // ID del checkbox en el HTML
        name: 'Límite Municipal',
        type: 'wfs-polygon',
        url: 'http://192.168.1.67:8080/geoserver/municipios/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=municipios:municipios&outputFormat=application/json&srsName=EPSG:4326',
        style: {
            color: '#007bff',
            weight: 1.5,
            fillColor: '#5a99e2',
            fillOpacity: 0.4,
        },
        popupProperty: 'nomgeo' // Propiedad a mostrar en el popup
    },
    {
        id: 'grupo_equipamiento', // ID del checkbox en el HTML
        name: 'Grado de Marginación',
        type: 'api-choropleth',
        url: 'http://127.0.0.1:8000/api/marginacion/',
        popupFunction: (props) => `<h4>${props.colonia}</h4><b>Grado de Marginación:</b> ${props.gm_2020}`
    },
    {
        id: 'grupo_infraestructura', // ID del checkbox en el HTML
        name: 'Ayudantías',
        type: 'wfs-point',
        url: 'http://192.168.1.67:8080/geoserver/implan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=implan%3Aayudantias&outputFormat=application%2Fjson&srsName=EPSG:4326',
        style: {
            radius: 6,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        },
        popupProperty: 'nombre' // Asumiendo que la propiedad se llama 'nombre'
    }
    // ... Aquí puedes añadir cientos de capas más ...
];