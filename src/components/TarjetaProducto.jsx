// frontend-ecommerce/src/components/TarjetaProducto.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// Importa el componente Button de react-bootstrap
import Button from 'react-bootstrap/Button'; //

function TarjetaProducto({ producto, alAnadirAlCarrito, esAdmin, alEditar, alEliminar }) {
    const navegar = useNavigate();

    // Función para manejar la navegación a la página de detalle del producto
    const verDetalle = () => {
        navegar(`/producto/${producto._id}`);
    };

    return (
        <div className="product-card"> {/* Mantengo 'product-card' por si tienes estilos CSS asociados */}
            {/* Contenido clickeable para ver el detalle del producto */}
            {/* Se añade un div para que la tarjeta sea clickeable para ver detalles */}
            <div onClick={verDetalle} className="product-card-content-clickable">
                <h3>{producto.nombre}</h3>
                <p>{producto.descripcion}</p>
                <p>Precio: ${producto.precio.toFixed(2)}</p>
                {producto.imagen && (
                    <img src={producto.imagen} alt={producto.nombre} style={{ maxWidth: '100px', height: 'auto' }} />
                )}
            </div>

            {/* Puedes optar por cambiar este también a Button de react-bootstrap si lo deseas */}
            <button
                className="add-to-cart-button" // Mantengo 'add-to-cart-button' por si tienes estilos CSS asociados
                onClick={() => alAnadirAlCarrito(producto._id, producto.nombre)}
            >
                Agregar al Carrito
            </button>

            {/* Renderizado condicional de los botones de administración */}
            {esAdmin && (
                <div className="admin-actions"> {/* Mantengo 'admin-actions' por si tienes estilos CSS asociados */}
                    {/* Botón de Editar con react-bootstrap */}
                    <Button
                        variant="warning" // Color amarillo, típico para editar
                        size="sm" // Tamaño pequeño
                        onClick={() => alEditar(producto._id)} // Llama a la función alEditar pasada por prop
                        className="me-2" // Margen a la derecha para separar del botón de eliminar (clase de utilidad de Bootstrap)
                    >
                        <i className="fas fa-edit"></i> Editar
                    </Button>

                    {/* Botón de Eliminar con react-bootstrap */}
                    <Button
                        variant="danger" // Color rojo, típico para eliminar
                        size="sm" // Tamaño pequeño
                        onClick={() => alEliminar(producto._id, producto.nombre)} // Llama a la función alEliminar pasada por prop
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
    esAdmin: PropTypes.bool.isRequired, // Propiedad para controlar la visibilidad
    alEditar: PropTypes.func.isRequired,   // Función para manejar la edición
    alEliminar: PropTypes.func.isRequired, // Función para manejar la eliminación
};

export default TarjetaProducto;