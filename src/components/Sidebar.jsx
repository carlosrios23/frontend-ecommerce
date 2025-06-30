// frontend-ecommerce/src/components/Sidebar.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react'; // Agregamos useState y useCallback
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Importa el CSS de la barra lateral
import '../assets/styles/Sidebar.css';

function Sidebar({ esAdmin, estaLogueado, alCerrarSesion, conteoItemsCarrito }) {
    const navRef = useRef(null);
    const bodyRef = useRef(document.body);
    const ubicacion = useLocation();
    const navegar = useNavigate();

    // NUEVO ESTADO: Controla si la sidebar está expandida (solo relevante para mobile o si se fuerza en desktop)
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    // NUEVO ESTADO: Controla el submenú de "Administración"
    const [isSubmenuAdminOpen, setIsSubmenuAdminOpen] = useState(false);

    // Función para manejar el toggle de la sidebar
    const toggleSidebar = useCallback(() => {
        setIsSidebarExpanded(prev => !prev);
    }, []);

    // Función para cerrar la sidebar (útil al hacer clic en un enlace o fuera)
    const closeSidebar = useCallback(() => {
        setIsSidebarExpanded(false);
    }, []);

    // Efecto para aplicar/remover clases 'expander' y 'body-pd' basadas en el estado
    useEffect(() => {
        const navbar = navRef.current;
        const bodypadding = bodyRef.current;

        if (navbar && bodypadding) {
            if (isSidebarExpanded) {
                // Solo aplicar 'body-pd' en mobile para empujar el contenido
                if (window.innerWidth < 768) {
                    navbar.classList.add('expander');
                    bodypadding.classList.add('body-pd');
                } else {
                    // En desktop, si se fuerza la expansión (ej. clic en el icono)
                    navbar.classList.add('expander');
                    bodypadding.classList.add('body-pd'); // También empuja en desktop
                }
            } else {
                navbar.classList.remove('expander');
                bodypadding.classList.remove('body-pd');
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
        const enlacesColor = document.querySelectorAll('.nav-link');
        const rutaActual = ubicacion.pathname;

        enlacesColor.forEach(l => {
            l.classList.remove('active');
            // Si la ruta actual es la misma que el href del enlace, lo activa
            if (l.getAttribute('href') === rutaActual) {
                l.classList.add('active');
            }
        });

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
                <div className="header-toggle" id="nav-toggle" onClick={toggleSidebar}> {/* Usamos onClick del estado */}
                    <i className='fas fa-bars'></i>
                </div>
                {/* Puedes añadir otros elementos del header aquí, como la imagen de perfil */}
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
                        <div className="nav-menu-icon" onClick={toggleSidebar}>
                            <i className='fas fa-bars'></i>
                        </div>

                        <Link to="/" className="nav-brand" onClick={handleNavLinkClick}>
                            <i className='fas fa-leaf nav-brand-icon'></i>
                            <span className="nav-brand-name">Subastas enLinea</span>
                        </Link>

                        <div className="nav-list">
                            <Link to="/" className="nav-link" onClick={handleNavLinkClick}>
                                <i className='fas fa-home nav-link-icon'></i>
                                <span className="nav-link-name">Inicio</span>
                            </Link>

                            {/* Enlace al Carrito */}
                            <Link to="/carrito" className="nav-link" onClick={handleNavLinkClick}>
                                <i className='fas fa-shopping-cart nav-link-icon'></i>
                                <span className="nav-link-name">Carrito {conteoItemsCarrito > 0 && `(${conteoItemsCarrito})`}</span>
                            </Link>

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
                                    <Link to="/agregar-producto" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                        Agregar Producto
                                    </Link>
                                    {/* Puedes añadir más sub-enlaces de administración aquí */}
                                    <Link to="/gestionar-productos" className="collapse-sub-link" onClick={handleNavLinkClick}>
                                        Gestionar Productos
                                    </Link>
                                </div>
                            )}

                            {/* Enlaces de Autenticación/Cerrar Sesión */}
                            {!estaLogueado ? (
                                <>
                                    <Link to="/registro" className="nav-link" onClick={handleNavLinkClick}>
                                        <i className='fas fa-user-plus nav-link-icon'></i>
                                        <span className="nav-link-name">Registro</span>
                                    </Link>
                                    <Link to="/login" className="nav-link" onClick={handleNavLinkClick}>
                                        <i className='fas fa-sign-in-alt nav-link-icon'></i>
                                        <span className="nav-link-name">Iniciar Sesión</span>
                                    </Link>
                                </>
                            ) : (
                                <button onClick={manejarCerrarSesionYNavegar} className="nav-link logout-button-sidebar">
                                    <i className='fas fa-sign-out-alt nav-link-icon'></i>
                                    <span className="nav-link-name">Cerrar Sesión</span>
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
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