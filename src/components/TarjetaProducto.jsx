// frontend-ecommerce/src/components/TarjetaProducto.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// Importa el componente Button de react-bootstrap
import Button from 'react-bootstrap/Button';

function TarjetaProducto({ producto, alAnadirAlCarrito, esAdmin, alEditar, alEliminar }) {
    const navegar = useNavigate();

    // Función para manejar la navegación a la página de detalle del producto
    const verDetalle = () => {
        navegar(`/producto/${producto._id}`);
    };

    return (
        <div className="product-card">
            {/* Contenido clickeable para ver el detalle del producto */}
            <div onClick={verDetalle} className="product-card-content">
                <h3 className="product-name">{producto.nombre}</h3>
                <p className="product-description">{producto.descripcion}</p>
                <p className="product-price">Precio: ${producto.precio.toFixed(2)}</p>
                {producto.imagen && (
                    <img 
                        src={producto.imagen} 
                        alt={producto.nombre} 
                        className="product-image"
                    />
                )}
            </div>

            <Button
                className="add-to-cart-button"
                onClick={(e) => {
                    e.stopPropagation();
                    alAnadirAlCarrito(producto._id, producto.nombre);
                }}
            >
                Agregar al Carrito
            </Button>

            {/* Renderizado condicional de los botones de administración */}
            {esAdmin && (
                <div className="admin-actions">
                    <Button
                        className="edit-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            alEditar(producto._id);
                        }}
                    >
                        <i className="fas fa-edit"></i> Editar
                    </Button>

                    <Button
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            alEliminar(producto._id, producto.nombre);
                        }}
                    >
                        <i className="fas fa-trash-alt"></i> Eliminar
                    </Button>
                </div>
            )}
        </div>
    );
}

TarjetaProducto.propTypes = {
    producto: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        nombre: PropTypes.string.isRequired,
        descripcion: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        imagen: PropTypes.string,
    }).isRequired,
    alAnadirAlCarrito: PropTypes.func.isRequired,
    esAdmin: PropTypes.bool.isRequired,
    alEditar: PropTypes.func.isRequired,
    alEliminar: PropTypes.func.isRequired,
};

export default TarjetaProducto;