// js/main.js
import { initializeMap } from './map_layers.js';
import { initializeUI } from './LayerManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa el mapa y devuelve las instancias del mapa y las capas base
    const { map, base, satelital, topografico } = initializeMap();
    
    // 2. Inicializa toda la interfaz de usuario, pasándole las instancias que necesita
    initializeUI(map, base, satelital, topografico);

    console.log("Visor geográfico inicializado correctamente. 🗺️");
});