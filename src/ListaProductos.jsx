// frontend-ecommerce/src/ListaProductos.jsx

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TarjetaProducto from './components/TarjetaProducto';
import SearchBar from './components/SearchBar'; // La "B" debe ser MAYÚSCULA~

// Importa los componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row'; // Necesario para la cuadrícula de productos
import Col from 'react-bootstrap/Col'; // Necesario para la cuadrícula de productos
import BACKEND_URL from './config';

function ListaProductos({ alActualizarConteoCarrito, esAdmin }) {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]); // Nuevo estado para productos filtrados
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda
    const navegar = useNavigate();

    const obtenerToken = () => localStorage.getItem('token');

    const obtenerProductos = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/productos`);

            setProductos(response.data);
            setProductosFiltrados(response.data); // Inicialmente, todos los productos son "filtrados"
        } catch (err) {
            console.error("Error al obtener los productos:", err);
            setError(err.response?.data?.message || 'Error al cargar los productos. Inténtalo de nuevo más tarde.');
        } finally {
            setCargando(false);
        }
    }, []);

    const obtenerConteoItemsCarrito = useCallback(async () => {
        const token = obtenerToken();
        if (!token) {
            if (typeof alActualizarConteoCarrito === 'function') {
                alActualizarConteoCarrito(0);
            }
            return;
        }
        try {
            const response = await axios.get(`${BACKEND_URL}/api/carrito`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (typeof alActualizarConteoCarrito === 'function') {
                alActualizarConteoCarrito(response.data.items.length);
            }
        } catch (err) {
            console.error('Error al obtener el contador del carrito:', err);
            if (typeof alActualizarConteoCarrito === 'function') {
                alActualizarConteoCarrito(0);
            }
        }
    }, [alActualizarConteoCarrito]);

    useEffect(() => {
        obtenerProductos();
        obtenerConteoItemsCarrito();
    }, [obtenerProductos, obtenerConteoItemsCarrito]);

    // Nueva función para manejar la búsqueda
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        if (term) {
            const lowerCaseTerm = term.toLowerCase();
            const resultados = productos.filter(producto =>
                producto.nombre.toLowerCase().includes(lowerCaseTerm) ||
                producto.descripcion.toLowerCase().includes(lowerCaseTerm)
            );
            setProductosFiltrados(resultados);
        } else {
            setProductosFiltrados(productos); // Si el término está vacío, muestra todos los productos
        }
    }, [productos]); // Depende de 'productos' para filtrar siempre la lista completa

    const manejarAnadirAlCarrito = async (productoId, nombreProducto) => {
        setMensaje('');
        setError(null);
        const token = obtenerToken();

        if (!token) {
            setMensaje('Debes iniciar sesión para agregar productos al carrito.');
            navegar('/login');
            return;
        }

        try {
           await axios.post(`${BACKEND_URL}/api/carrito/items`,

                { productoId: productoId, cantidad: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMensaje(`"${nombreProducto}" agregado al carrito.`);
            await obtenerConteoItemsCarrito();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            console.error('Error al agregar al carrito:', err.response?.data?.mensaje || err.message);
            setError(err.response?.data?.mensaje || 'Error al agregar el producto al carrito.');
            setTimeout(() => setError(null), 5000);
        }
    };

    const manejarEditarProducto = (productoId) => {
        navegar(`/editar-producto/${productoId}`);
    };

    const manejarEliminarProducto = async (productoId, nombreProducto) => {
        setMensaje('');
        setError(null);
        const token = obtenerToken();

        if (!token) {
            setError('No estás autenticado para eliminar productos.');
            navegar('/login');
            return;
        }

        if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto "${nombreProducto}"?`)) {
            return;
        }

        try {
           await axios.delete(`${BACKEND_URL}/api/productos/${productoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMensaje(`"${nombreProducto}" eliminado exitosamente.`);
            obtenerProductos(); // Vuelve a cargar todos los productos para reflejar el cambio
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            console.error('Error al eliminar el producto:', err.response?.data?.mensaje || err.message);
            setError(err.response?.data?.mensaje || 'Error al eliminar el producto.');
            setTimeout(() => setError(null), 5000);
        }
    };

    return (
        <Container className="lista-productos-container">
            <div className='-lista-productos-titulo'>
            <h2 className="lista-productos-container">Nuestros Productos</h2>
            </div>
            {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            
            {/* Integra la barra de búsqueda aquí */}
            <SearchBar onSearch={handleSearch} />

            {cargando ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando productos...</span>
                    </Spinner>
                    <p className="ms-3">Cargando productos...</p>
                </div>
            ) : error ? (
                <div className="text-center mt-5">
                    <h3>¡Uy! Algo salió mal.</h3>
                    <p>{error}</p>
                    <Button variant="primary" onClick={obtenerProductos}>Reintentar</Button>
                </div>
            ) : (
                productosFiltrados.length === 0 ? (
                    <div className="mensaje-productos-vacio">
                        <h3 className='mensaje-productos-vacio'>No se encontraron productos{searchTerm ? ` para "${searchTerm}"` : ''}.</h3>
                        {searchTerm && (
                            <Button variant="outline-primary" onClick={() => handleSearch('')}>
                                Mostrar todos los productos
                            </Button>
                        )}
                        {!searchTerm && !error && productos.length === 0 && ( // Solo si no hay productos en total
                            <>
                                <p>Vuelve más tarde o, si eres administrador, ¡añade algunos!</p>
                                {esAdmin && (
                                    <Button variant="success" onClick={() => navegar('/agregar-producto')}>
                                        Añadir Nuevo Producto
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4"> {/* Usa Row y Col para la cuadrícula */}
                        {productosFiltrados.map(producto => (
                            <Col key={producto._id} className="d-flex align-items-stretch"> {/* d-flex y align-items-stretch para tarjetas de igual altura */}
                                <TarjetaProducto
                                    producto={producto}
                                    alAnadirAlCarrito={manejarAnadirAlCarrito}
                                    esAdmin={esAdmin}
                                    alEditar={manejarEditarProducto}
                                    alEliminar={manejarEliminarProducto}
                                />
                            </Col>
                        ))}
                    </Row>
                )
            )}
        </Container>
    );
}

export default ListaProductos;