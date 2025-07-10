// frontend-ecommerce/src/components/Sidebar.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Importa el CSS de la barra lateral
import '../assets/styles/Sidebar.css';

function Sidebar({ esAdmin, estaLogueado, alCerrarSesion, conteoItemsCarrito }) {
    // Referencia al elemento de la barra de navegación para manipular sus clases.
    const navRef = useRef(null);
    // Hook para obtener la ubicación actual de la ruta, útil para cerrar submenús al navegar.
    const ubicacion = useLocation();
    // Hook para la navegación programática.
    const navegar = useNavigate();

    // Estado para controlar si la barra lateral está expandida o colapsada.
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    // Estado para controlar la visibilidad del submenú de administración.
    const [isSubmenuAdminOpen, setIsSubmenuAdminOpen] = useState(false);

    /**
     * @function toggleSidebar
     * @description Alterna el estado de expansión de la barra lateral.
     * Utiliza useCallback para memorizar la función y evitar recreaciones innecesarias.
     */
    const toggleSidebar = useCallback(() => {
        setIsSidebarExpanded(prev => !prev);
    }, []);

    /**
     * @function closeSidebar
     * @description Cierra la barra lateral.
     * Utiliza useCallback para memorizar la función.
     */
    const closeSidebar = useCallback(() => {
        setIsSidebarExpanded(false);
    }, []);

    // Efecto para controlar el overflow del body en dispositivos móviles cuando la sidebar está abierta.
    // Esto previene el scroll del contenido de fondo cuando la sidebar está activa.
    useEffect(() => {
        const esMobile = window.innerWidth < 768;
        if (isSidebarExpanded && esMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Función de limpieza para asegurar que el scroll se restablezca al desmontar el componente.
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarExpanded]); // Depende de isSidebarExpanded para re-ejecutarse.

    // Efecto para añadir/remover la clase 'expander' a la barra lateral en móvil.
    // Aunque el CSS maneja gran parte del comportamiento, este asegura la clase.
    useEffect(() => {
        const navbar = navRef.current;
        const esMobile = window.innerWidth < 768;

        if (navbar && esMobile) {
            if (isSidebarExpanded) {
                navbar.classList.add('expander');
            } else {
                navbar.classList.remove('expander');
            }
        }
    }, [isSidebarExpanded]); // Depende de isSidebarExpanded.

    // Efecto para manejar el clic fuera de la barra lateral y cerrarla en dispositivos móviles.
    useEffect(() => {
        const toggleBtn = document.getElementById('nav-toggle');

        const handleClickOutside = (event) => {
            // Solo se aplica en modo expandido y en dispositivos móviles.
            if (isSidebarExpanded && window.innerWidth < 768) {
                // Verifica si el clic no fue dentro de la barra lateral ni en el botón de toggle.
                if (navRef.current && !navRef.current.contains(event.target) &&
                    toggleBtn && !toggleBtn.contains(event.target)) {
                    closeSidebar(); // Cierra la barra lateral.
                }
            }
        };

        // Añade el event listener al montar el componente.
        document.addEventListener('mousedown', handleClickOutside);
        // Limpia el event listener al desmontar el componente.
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarExpanded, closeSidebar]); // Depende de isSidebarExpanded y closeSidebar.

    // Efecto para cerrar el submenú de administración cuando la ruta cambia.
    useEffect(() => {
        setIsSubmenuAdminOpen(false);
    }, [ubicacion.pathname]); // Depende de la ruta actual.

    /**
     * @function manejarCerrarSesionYNavegar
     * @description Maneja el cierre de sesión, redirige al login y cierra la sidebar.
     */
    const manejarCerrarSesionYNavegar = () => {
        alCerrarSesion(); // Llama a la función de cierre de sesión proporcionada por props.
        navegar('/login'); // Redirige al usuario a la página de login.
        closeSidebar(); // Cierra la barra lateral después de la acción.
    };

    /**
     * @function handleNavLinkClick
     * @description Cierra la sidebar si está en modo móvil al hacer clic en un enlace de navegación.
     */
    const handleNavLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* Cabecera del sitio. Contiene el botón para abrir/cerrar la sidebar en móvil. */}
            <header className="header" id="header">
                <div className="header-toggle btn-animated" id="nav-toggle" onClick={toggleSidebar}>
                    <i className='fas fa-bars'></i> {/* Icono de hamburguesa */}
                </div>
            </header>

            {/* Barra lateral de navegación */}
            <div className={`l-navbar ${isSidebarExpanded ? 'expander' : ''}`} id="navbar" ref={navRef}>
                <nav className="nav">
                    <div>
                        {/* Icono de menú dentro de la sidebar, visible cuando está expandida en escritorio y en móvil */}
                        <div className="nav-menu-icon btn-animated" onClick={toggleSidebar}>
                            <i className='fas fa-bars'></i>
                        </div>

                        {/* Enlace al inicio de la tienda, con icono y nombre */}
                        <Link to="/" className="nav-brand" onClick={handleNavLinkClick}>
                            <i className='fas fa-leaf nav-brand-icon float-effect'></i>
                            <span className="nav-brand-name">Mi tienda Online</span>
                        </Link>

                        {/* Lista de enlaces de navegación principal */}
                        <div className="nav-list">
                            <NavLink to="/" className={({ isActive }) =>
                                `nav-link ${isActive ? 'active active-inicio' : ''}`
                            } onClick={handleNavLinkClick}>
                                <i className='fas fa-home nav-link-icon'></i>
                                <span className="nav-link-name">Inicio</span>
                            </NavLink>

                            <NavLink to="/carrito" className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            } onClick={handleNavLinkClick}>
                                <i className='fas fa-shopping-cart nav-link-icon'></i>
                                <span className="nav-link-name">Carrito {conteoItemsCarrito > 0 && `(${conteoItemsCarrito})`}</span>
                            </NavLink>

                            {/* Sección de administración, solo visible para usuarios administradores */}
                            {esAdmin && (
                                <>
                                    {/* Botón para alternar el submenú de administración */}
                                    <div className={`collapse ${isSubmenuAdminOpen ? 'showCollapse' : ''}`} onClick={() => setIsSubmenuAdminOpen(!isSubmenuAdminOpen)}>
                                        <i className='fas fa-cogs nav-link-icon'></i>
                                        <span className="nav-link-name">Administración</span>
                                        <i className={`fas fa-chevron-down collapse-link collapse-icon ${isSubmenuAdminOpen ? 'rotate' : ''}`}></i>
                                    </div>

                                    {/* Submenú de administración */}
                                    <div className={`collapse-menu ${isSubmenuAdminOpen ? 'showCollapse' : ''}`}>
                                        <NavLink to="/agregar-producto" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                            Agregar Producto
                                        </NavLink>
                                        <NavLink to="/gestionar-productos" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                            Gestionar Productos
                                        </NavLink>
                                    </div>
                                </>
                            )}

                            {/* Enlaces de autenticación (Registro/Iniciar Sesión o Cerrar Sesión) */}
                            {!estaLogueado ? (
                                <>
                                    <NavLink to="/registro" className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } onClick={handleNavLinkClick}>
                                        <i className='fas fa-user-plus nav-link-icon'></i>
                                        <span className="nav-link-name">Registro</span>
                                    </NavLink>
                                    <NavLink to="/login" className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } onClick={handleNavLinkClick}>
                                        <i className='fas fa-sign-in-alt nav-link-icon'></i>
                                        <span className="nav-link-name">Iniciar Sesión</span>
                                    </NavLink>
                                </>
                            ) : (
                                <button type="button" onClick={manejarCerrarSesionYNavegar} className="nav-link logout-button-sidebar">
                                    <i className='fas fa-sign-out-alt nav-link-icon'></i>
                                    <span className="nav-link-name">Cerrar Sesión</span>
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Overlay para el efecto de oscurecimiento/desenfoque del contenido principal */}
            {/* Este div se superpondrá al contenido y aplicará los estilos de oscurecimiento/desenfoque */}
            <div className={`main-content-overlay ${isSidebarExpanded ? 'visible' : ''}`} onClick={closeSidebar} />
        </>
    );
}

// Definición de PropTypes para validar las props pasadas al componente Sidebar.
Sidebar.propTypes = {
    esAdmin: PropTypes.bool.isRequired,
    estaLogueado: PropTypes.bool.isRequired,
    alCerrarSesion: PropTypes.func.isRequired,
    conteoItemsCarrito: PropTypes.number.isRequired
};

export default Sidebar;