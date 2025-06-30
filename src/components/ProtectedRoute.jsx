// frontend-ecommerce/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoute({ children, esAdmin }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // Asegúrate de que el rol se guarda como 'userRole'

    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si la ruta está destinada solo a administradores y el usuario no es admin, redirige
    // La prop 'esAdmin' en este componente ProtectedRoute indica si la RUTA requiere ser admin.
    // Si la prop 'esAdmin' es true, entonces verificamos el rol.
    if (esAdmin && userRole !== 'admin') {
        // Podrías redirigir a una página de "Acceso Denegado" o a la página principal
        return <Navigate to="/" replace />; 
    }

    // Si pasa todas las verificaciones, renderiza el componente hijo
    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired, // 'children' puede ser cualquier cosa renderizable
    esAdmin: PropTypes.bool, // Indica si esta ruta específica requiere rol de admin
};

// Establece un valor predeterminado para esAdmin, en caso de que no se pase
// Si es false, significa que la ruta solo requiere que el usuario esté logueado, no necesariamente ser admin.
ProtectedRoute.defaultProps = {
    esAdmin: false, 
};

export default ProtectedRoute;