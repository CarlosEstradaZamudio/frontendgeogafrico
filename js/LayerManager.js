// js/ui-manager.js
import { layersConfig } from './layersConfig.js';
import { toggleLayer } from './map_layers.js';

export function initializeUI(map, base, satelital, topografico) {

    // --- 1. LÓGICA DE CAPAS TEMÁTICAS (SIDEBAR) ---
    const allCheckboxes = document.querySelectorAll('.sidebar-izquierda input[type="checkbox"]');

    allCheckboxes.forEach(checkbox => {
        const config = layersConfig.find(c => c.controlId === checkbox.id);
        if (config) {
            checkbox.addEventListener('change', (e) => {
                toggleLayer(config, e.target.checked, map);
            });
        }
    });

    // --- 2. LÓGICA PARA GRUPOS DE CAPAS (PADRE-HIJO) ---
    document.querySelectorAll('.layer-group').forEach(group => {
        const parent = group.querySelector('.parent-checkbox');
        const children = group.querySelectorAll('.child-checkbox');
        
        if (!parent || children.length === 0) return;

        parent.addEventListener('change', () => {
            children.forEach(child => {
                if (!child.disabled) {
                    child.checked = parent.checked;
                    // Disparamos el evento 'change' para que se active la lógica de añadir/quitar capa
                    child.dispatchEvent(new Event('change'));
                }
            });
        });

        children.forEach(child => {
            child.addEventListener('change', () => {
                const checkedChildren = group.querySelectorAll('.child-checkbox:checked').length;
                const totalChildren = group.querySelectorAll('.child-checkbox:not(:disabled)').length;

                if (checkedChildren === 0) {
                    parent.checked = false;
                    parent.indeterminate = false;
                } else if (checkedChildren === totalChildren) {
                    parent.checked = true;
                    parent.indeterminate = false;
                } else {
                    parent.checked = false;
                    parent.indeterminate = true;
                }
            });
        });
    });

    // --- 3. LÓGICA PARA BOTONES DE EXPANDIR/COLAPSAR ---
    document.querySelectorAll('.toggle-sublayers').forEach(button => {
        button.addEventListener('click', () => {
            const group = button.closest('.layer-group');
            group.classList.toggle('is-open'); // Necesitarás una clase CSS .is-open para mostrar/ocultar .sublayer-list
        });
    });

    // --- 4. LÓGICA DEL BOTÓN PARA OCULTAR/MOSTRAR SIDEBAR ---
    const sidebar = document.getElementById("sidebar");
    const mainContainer = document.querySelector(".main-contenido");
    const toggleSidebarButton = document.getElementById("toggle-sidebar");
    const icon = toggleSidebarButton.querySelector("i");

    toggleSidebarButton.addEventListener("click", () => {
        sidebar.classList.toggle("oculto"); // Necesitarás una clase .oculto en tu CSS
        mainContainer.classList.toggle("sidebar-open");
        icon.classList.toggle("fa-chevron-right");
        icon.classList.toggle("fa-chevron-left");
        setTimeout(() => map.invalidateSize(), 300);
    });

    const mapStyleButtons = document.querySelectorAll(".map-style-button");

    mapStyleButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Primero, maneja el estado visual de los botones
            mapStyleButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            // Luego, cambia la capa del mapa según el ID del botón clickeado
            const id = button.id;
            
            // Quita todas las capas base para evitar conflictos
            map.removeLayer(base);
            map.removeLayer(satelital);
            map.removeLayer(topografico);

            // Añade la capa correcta
            if (id === 'mapa-base') {
                map.addLayer(base);
            } else if (id === 'mapa-satelital') {
                map.addLayer(satelital);
            } else if (id === 'mapa-topografico') {
                map.addLayer(topografico);
            }
        });
    });
    
    // --- Lógica adicional de la interfaz ---
    const mapControlsContainer = document.getElementById("mapControls");
    const triggerButton = mapControlsContainer.querySelector(".map-controls-trigger");

    triggerButton.addEventListener("click", (event) => {
        event.stopPropagation();
        mapControlsContainer.classList.toggle("is-open");
    });

    document.addEventListener("click", (event) => {
        if (mapControlsContainer.classList.contains("is-open") && !mapControlsContainer.contains(event.target)) {
            mapControlsContainer.classList.remove("is-open");
        }
    });
}