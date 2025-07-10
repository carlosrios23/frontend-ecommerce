// frontend-ecommerce/src/components/Sidebar.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react'; // Agregamos useState y useCallback
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Usamos NavLink en lugar de Link para enlaces activos
import PropTypes from 'prop-types';

// Importa el CSS de la barra lateral
import '../assets/styles/Sidebar.css';

function Sidebar({ esAdmin, estaLogueado, alCerrarSesion, conteoItemsCarrito }) {
    const navRef = useRef(null);
    const ubicacion = useLocation();
    const navegar = useNavigate();

    // NUEVO ESTADO: Controla si la sidebar está expandida (solo relevante para mobile o si se fuerza en desktop)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    // NUEVO ESTADO: Controla el submenú de "Administración"
    const [isSubmenuAdminOpen, setIsSubmenuAdminOpen] = useState(false);
    // Estados para controlar overlays
    const [showOverlayMobile, setShowOverlayMobile] = useState(false);
    const [showOverlayDesktop, setShowOverlayDesktop] = useState(false);

    // Función para manejar el toggle de la sidebar
    const toggleSidebar = useCallback(() => {
        setIsSidebarExpanded(prev => !prev);
    }, []);

    // Función para cerrar la sidebar (útil al hacer clic en un enlace o fuera)
    const closeSidebar = useCallback(() => {
        setIsSidebarExpanded(false);
    }, []);

    // NUEVA FUNCIÓN: Maneja el clic en el overlay
    const handleOverlayClick = useCallback(() => {
        closeSidebar();
    }, [closeSidebar]);

    // Bloquear el scroll del body en mobile cuando la sidebar esté abierta
    useEffect(() => {
        const esMobile = window.innerWidth < 768;

        if (isSidebarExpanded && esMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarExpanded]);

    // Efecto para manejar qué overlay mostrar según tamaño de pantalla
    useEffect(() => {
        const actualizarOverlay = () => {
            const esMobile = window.innerWidth < 768;
            if (isSidebarExpanded && esMobile) {
                setShowOverlayMobile(true);
                setShowOverlayDesktop(false);
            } else if (isSidebarExpanded && !esMobile) {
                setShowOverlayDesktop(true);
                setShowOverlayMobile(false);
            } else {
                setShowOverlayMobile(false);
                setShowOverlayDesktop(false);
            }
        };

        actualizarOverlay();
        window.addEventListener('resize', actualizarOverlay);
        return () => window.removeEventListener('resize', actualizarOverlay);
    }, [isSidebarExpanded]);

    // Efecto para aplicar/remover clases 'expander' y 'body-pd' basadas en el estado
    useEffect(() => {
        const navbar = navRef.current;

        if (navbar) {
            if (isSidebarExpanded) {
                // Solo aplicar 'body-pd' en mobile para empujar el contenido
                if (window.innerWidth < 768) {
                    navbar.classList.add('expander');
                    document.body.classList.add('body-pd');
                } else {
                    navbar.classList.add('expander');
                    document.body.classList.add('body-pd'); // También empuja en desktop
                }
            } else {
                navbar.classList.remove('expander');
                document.body.classList.remove('body-pd');
            }
        }
    }, [isSidebarExpanded]); // Depende de isSidebarExpanded

    // Efecto para manejar clicks fuera de la sidebar (solo en mobile)
    useEffect(() => {
        const toggleBtn = document.getElementById('nav-toggle'); // El botón de hamburguesa del header

        const handleClickOutside = (event) => {
            // Solo relevante si la sidebar está expandida y estamos en mobile
            if (isSidebarExpanded && window.innerWidth < 768) {
                // Si el clic no fue dentro de la navbar Y no fue en el botón de toggle
                if (navRef.current && !navRef.current.contains(event.target) &&
                    toggleBtn && !toggleBtn.contains(event.target)) {
                    closeSidebar();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarExpanded, closeSidebar]);

    // Lógica para resaltar enlace activo y submenús
    useEffect(() => {
        // Toggle del submenú de administración
        // Se maneja con estado de React ahora
    }, [ubicacion.pathname]);

    // Función para manejar el cierre de sesión, que también navega
    const manejarCerrarSesionYNavegar = () => {
        alCerrarSesion(); // Llama a la prop para limpiar el estado y localStorage
        navegar('/login'); // Redirige a la página de login
        closeSidebar(); // Cierra la sidebar después de la acción
    };

    // Función para manejar el clic en un enlace de navegación
    const handleNavLinkClick = () => {
        // Cierra la sidebar si está abierta, especialmente en mobile, al hacer clic en un enlace
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    return (
        <div id="body-pd" className={isSidebarExpanded ? 'body-pd' : ''}> {/* Aplica body-pd condicionalmente */}
            <header className="header" id="header">
                <div className="header-toggle btn-animated" id="nav-toggle" onClick={toggleSidebar}> {/* Usamos onClick del estado */}
                    <i className='fas fa-bars'></i>
                </div>
                {/* Se puede añadir otros elementos del header aquí, como la imagen de perfil */}
                {/* <div className="header-img">
                    <img src="https://i.imgur.com/your-profile-image.jpg" alt="" />
                </div> */}
            </header>

            {/* Sidebar principal */}
            <div className={`l-navbar ${isSidebarExpanded ? 'expander' : ''}`} id="navbar" ref={navRef}>
                <nav className="nav">
                    <div>
                        {/* El icono de menú dentro de la navbar, que es interactivo en desktop para el hover o clic */}
                        {/* En mobile, este se oculta por CSS, y el del header es el que funciona */}
                        <div className="nav-menu-icon btn-animated" onClick={toggleSidebar}>
                            <i className='fas fa-bars'></i>
                        </div>

                        <Link to="/" className="nav-brand" onClick={handleNavLinkClick}>
                            <i className='fas fa-leaf nav-brand-icon float-effect'></i>
                            <span className="nav-brand-name">Mi tienda Online</span>
                        </Link>

                        <div className="nav-list">
                            <NavLink to="/" className={({ isActive }) => `nav-link-animated ${isActive ? 'active' : ''}`} onClick={handleNavLinkClick}>
                                <i className='fas fa-home nav-link-icon'></i>
                                <span className="nav-link-name">Inicio</span>
                            </NavLink>

                            {/* Enlace al Carrito */}
                            <NavLink to="/carrito" className={({ isActive }) => `nav-link nav-link-animated ${isActive ? 'active' : ''}`} onClick={handleNavLinkClick}>
                                <i className='fas fa-shopping-cart nav-link-icon'></i>
                                <span className="nav-link-name">Carrito {conteoItemsCarrito > 0 && `(${conteoItemsCarrito})`}</span>
                            </NavLink>

                            {/* Mostrar Submenú de Administración solo si es administrador */}
                            {esAdmin && (
                                <div className={`collapse ${isSubmenuAdminOpen ? 'showCollapse' : ''}`} onClick={() => setIsSubmenuAdminOpen(!isSubmenuAdminOpen)}>
                                    <i className='fas fa-cogs nav-link-icon'></i> {/* Icono para "Administración" */}
                                    <span className="nav-link-name">Administración</span>
                                    <i className={`fas fa-chevron-down collapse-link collapse-icon ${isSubmenuAdminOpen ? 'rotate' : ''}`}></i>
                                </div>
                            )}
                            {esAdmin && isSubmenuAdminOpen && (
                                <div className="collapse-menu showCollapse"> {/* showCollapse se aplica aquí condicionalmente */}
                                    <NavLink to="/agregar-producto" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                        Agregar Producto
                                    </NavLink>
                                    <NavLink to="/gestionar-productos" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                        Gestionar Productos
                                    </NavLink>
                                </div>
                            )}

                            {/* Enlaces de Autenticación/Cerrar Sesión */}
                            {!estaLogueado ? (
                                <>
                                    <NavLink to="/registro" className={({ isActive }) => `nav-link nav-link-animated ${isActive ? 'active' : ''}`} onClick={handleNavLinkClick}>
                                        <i className='fas fa-user-plus nav-link-icon'></i>
                                        <span className="nav-link-name">Registro</span>
                                    </NavLink>
                                    <NavLink to="/login" className={({ isActive }) => `nav-link nav-link-animated ${isActive ? 'active' : ''}`} onClick={handleNavLinkClick}>
                                        <i className='fas fa-sign-in-alt nav-link-icon'></i>
                                        <span className="nav-link-name">Iniciar Sesión</span>
                                    </NavLink>
                                </>
                            ) : (
                                <button type="button" onClick={manejarCerrarSesionYNavegar} className="nav-link nav-link-animated logout-button-sidebar">
                                    <i className='fas fa-sign-out-alt nav-link-icon'></i>
                                    <span className="nav-link-name">Cerrar Sesión</span>
                                </button>
                            )}

                        </div>
                    </div>
                </nav>
            </div>

            {/* Overlay para mobile */}
            {showOverlayMobile && (
                <div 
                    className="mobile-sidebar-overlay" 
                    onClick={handleOverlayClick}
                />
            )}
            {/* Overlay para desktop */}
            {showOverlayDesktop && (
                <div 
                    className="desktop-sidebar-overlay" 
                    onClick={handleOverlayClick}
                />
            )}
        </div>
    );
}

Sidebar.propTypes = {
    esAdmin: PropTypes.bool.isRequired,
    estaLogueado: PropTypes.bool.isRequired,
    alCerrarSesion: PropTypes.func.isRequired,
    conteoItemsCarrito: PropTypes.number.isRequired
};

export default Sidebar;
