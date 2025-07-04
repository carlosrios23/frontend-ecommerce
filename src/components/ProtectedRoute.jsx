import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProtectedRoute({ children, esAdmin }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (esAdmin === undefined) {
        return null; // evita que React monte componentes aún
    }

    if (esAdmin && userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    esAdmin: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
    esAdmin: false,
};

export default ProtectedRoute;
