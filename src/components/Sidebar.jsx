// frontend-ecommerce/src/components/Sidebar.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Importa el CSS de la barra lateral
import '../assets/styles/Sidebar.css';

function Sidebar({ esAdmin, estaLogueado, alCerrarSesion, conteoItemsCarrito }) {
    const navRef = useRef(null);
    const ubicacion = useLocation();
    const navegar = useNavigate();

    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isSubmenuAdminOpen, setIsSubmenuAdminOpen] = useState(false);
    const [showOverlayMobile, setShowOverlayMobile] = useState(false);
    const [showOverlayDesktop, setShowOverlayDesktop] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarExpanded(prev => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarExpanded(false);
    }, []);

    const handleOverlayClick = useCallback(() => {
        closeSidebar();
    }, [closeSidebar]);

    useEffect(() => {
        const esMobile = window.innerWidth < 768;
        document.body.style.overflow = (isSidebarExpanded && esMobile) ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarExpanded]);

    useEffect(() => {
        const actualizarOverlay = () => {
            const esMobile = window.innerWidth < 768;
            setShowOverlayMobile(isSidebarExpanded && esMobile);
            setShowOverlayDesktop(isSidebarExpanded && !esMobile);
        };

        actualizarOverlay();
        window.addEventListener('resize', actualizarOverlay);
        return () => window.removeEventListener('resize', actualizarOverlay);
    }, [isSidebarExpanded]);

    useEffect(() => {
        const navbar = navRef.current;
        const esMobile = window.innerWidth < 768;

        if (navbar && esMobile) {
            if (isSidebarExpanded) {
                navbar.classList.add('expander');
                document.body.classList.add('body-pd');
            } else {
                navbar.classList.remove('expander');
                document.body.classList.remove('body-pd');
            }
        }
    }, [isSidebarExpanded]);

    useEffect(() => {
        const toggleBtn = document.getElementById('nav-toggle');

        const handleClickOutside = (event) => {
            if (isSidebarExpanded && window.innerWidth < 768) {
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

    useEffect(() => {
        // Cerrar submenús al cambiar de ruta
        setIsSubmenuAdminOpen(false);
    }, [ubicacion.pathname]);

    const manejarCerrarSesionYNavegar = () => {
        alCerrarSesion();
        navegar('/login');
        closeSidebar();
    };

    const handleNavLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    return (
        <div id="body-pd" className={isSidebarExpanded ? 'body-pd' : ''}>
            <header className="header" id="header">
                <div className="header-toggle btn-animated" id="nav-toggle" onClick={toggleSidebar}>
                    <i className='fas fa-bars'></i>
                </div>
            </header>

            <div className={`l-navbar ${isSidebarExpanded ? 'expander' : ''}`} id="navbar" ref={navRef}>
                <nav className="nav">
                    <div>
                        <div className="nav-menu-icon btn-animated" onClick={toggleSidebar}>
                            <i className='fas fa-bars'></i>
                        </div>

                        <Link to="/" className="nav-brand" onClick={handleNavLinkClick}>
                            <i className='fas fa-leaf nav-brand-icon float-effect'></i>
                            <span className="nav-brand-name">Mi tienda Online</span>
                        </Link>

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

                            {esAdmin && (
                                <>
                                    <div className={`collapse ${isSubmenuAdminOpen ? 'showCollapse' : ''}`} onClick={() => setIsSubmenuAdminOpen(!isSubmenuAdminOpen)}>
                                        <i className='fas fa-cogs nav-link-icon'></i>
                                        <span className="nav-link-name">Administración</span>
                                        <i className={`fas fa-chevron-down collapse-link collapse-icon ${isSubmenuAdminOpen ? 'rotate' : ''}`}></i>
                                    </div>
                                    
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

            {showOverlayMobile && (
                <div className="mobile-sidebar-overlay" onClick={handleOverlayClick} />
            )}
            {showOverlayDesktop && (
                <div className="desktop-sidebar-overlay" onClick={handleOverlayClick} />
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