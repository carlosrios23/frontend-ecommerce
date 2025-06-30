import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Importar componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card'; // Para un mejor diseño del detalle

// Asumiendo que esAdmin se pasa como prop desde App.jsx
// O puedes obtenerlo del localStorage si lo guardas allí al iniciar sesión
function DetalleProducto({ esAdmin, alActualizarConteoCarrito }) {
    const { id } = useParams();
    const navegar = useNavigate();
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(''); // Para mensajes de añadir al carrito

    const obtenerToken = () => localStorage.getItem('token');

    // Función para verificar si un descuento está activo
    const esDescuentoActivo = useCallback((prod) => {
        if (!prod || prod.porcentajeDescuento === undefined || prod.porcentajeDescuento <= 0) {
            return false;
        }
        const now = new Date();
        const inicio = prod.fechaInicioDescuento ? new Date(prod.fechaInicioDescuento) : null;
        const fin = prod.fechaFinDescuento ? new Date(prod.fechaFinDescuento) : null;

        const activo = (!inicio || now >= inicio) && (!fin || now <= fin);
        return activo;
    }, []);

    // Calcula el precio con descuento
    const calcularPrecioConDescuento = useCallback((prod) => {
        if (esDescuentoActivo(prod)) {
            return prod.precio * (1 - prod.porcentajeDescuento / 100);
        }
        return prod.precio;
    }, [esDescuentoActivo]);

    useEffect(() => {
        const obtenerDetalleProducto = async () => {
            setCargando(true);
            setError(null);
            try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`);
                setProducto(response.data);
            } catch (err) {
                console.error('Error al obtener el detalle del producto:', err);
                if (err.response && err.response.status === 404) {
                    setError('Producto no encontrado.');
                } else {
                    setError('No se pudo cargar el detalle del producto. Inténtalo de nuevo más tarde.');
                }
            } finally {
                setCargando(false);
            }
        };

        obtenerDetalleProducto();
    }, [id]);

    const obtenerConteoItemsCarrito = useCallback(async () => {
        const token = obtenerToken();
        if (!token) {
            if (typeof alActualizarConteoCarrito === 'function') {
                alActualizarConteoCarrito(0);
            }
            return;
        }
        try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/carrito`, {
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


    const manejarAnadirAlCarrito = async () => {
        setMensaje('');
        setError(null);
        const token = obtenerToken();

        if (!token) {
            setMensaje('Debes iniciar sesión para agregar productos al carrito.');
            navegar('/login');
            return;
        }

        if (!producto || producto.stock <= 0) {
            setError('Este producto no tiene stock disponible.');
            return;
        }

        try {
            await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/carrito/items`,
                { productoId: producto._id, cantidad: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setMensaje(`"${producto.nombre}" agregado al carrito.`);
            await obtenerConteoItemsCarrito();
            setTimeout(() => setMensaje(''), 3000);
        } catch (err) {
            console.error('Error al agregar al carrito:', err.response?.data?.mensaje || err.message);
            setError(err.response?.data?.mensaje || 'Error al agregar el producto al carrito.');
            setTimeout(() => setError(null), 5000);
        }
    };


    if (cargando) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando detalle del producto...</span>
                </Spinner>
                <p className="mt-3">Cargando detalle del producto...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5 text-center">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navegar('/')}>Volver a la Tienda</Button>
            </Container>
        );
    }

    if (!producto) { // Caso donde no hay producto (ej. 404 pero sin error explícito al inicio)
        return (
            <Container className="my-5 text-center">
                <Alert variant="info">Producto no encontrado.</Alert>
                <Button variant="primary" onClick={() => navegar('/')}>Volver a la Tienda</Button>
            </Container>
        );
    }

    const precioFinal = calcularPrecioConDescuento(producto);
    const descuentoAplicado = esDescuentoActivo(producto);

    return (
        <Container className="my-5">
            <Row>
                <Col md={6} className="text-center">
                    {producto.imagen ? (
                        <Image src={producto.imagen} alt={producto.nombre} fluid thumbnail className="product-detail-image" />
                    ) : (
                        <div className="product-no-image">No Image Available</div>
                    )}
                </Col>
                <Col md={6}>
                    <Card className="p-4 shadow-sm">
                        <Card.Body>
                            <Card.Title as="h2" className="mb-3">{producto.nombre}</Card.Title>
                            <Card.Text>
                                <strong className="d-block mb-2">Descripción:</strong> {producto.descripcion}
                            </Card.Text>

                            <Card.Text>
                                <strong className="d-block mb-2">Stock:</strong> {producto.stock > 0 ? producto.stock : <span className="text-danger">Agotado</span>}
                            </Card.Text>

                            {descuentoAplicado ? (
                                <Card.Text className="fs-4">
                                    Precio: <span className="text-decoration-line-through text-muted me-2">${producto.precio.toFixed(2)}</span>
                                    <span className="text-success fw-bold">${precioFinal.toFixed(2)}</span>
                                    <span className="ms-2 badge bg-success">-{producto.porcentajeDescuento}%</span>
                                </Card.Text>
                            ) : (
                                <Card.Text className="fs-4">
                                    Precio: <span className="fw-bold">${producto.precio.toFixed(2)}</span>
                                </Card.Text>
                            )}

                            {/* Mostrar información de descuento solo si es admin */}
                            {esAdmin && producto.porcentajeDescuento > 0 && (
                                <div className="mt-3 p-3 bg-light border rounded">
                                    <h5 className="mb-2">Información de Descuento (Admin):</h5>
                                    <p>Porcentaje de Descuento: {producto.porcentajeDescuento}%</p>
                                    <p>Inicio del Descuento: {producto.fechaInicioDescuento ? new Date(producto.fechaInicioDescuento).toLocaleDateString() : 'N/A'}</p>
                                    <p>Fin del Descuento: {producto.fechaFinDescuento ? new Date(producto.fechaFinDescuento).toLocaleDateString() : 'N/A'}</p>
                                    <p className={descuentoAplicado ? "text-success fw-bold" : "text-warning fw-bold"}>
                                        Estado: {descuentoAplicado ? 'Activo' : 'No Activo / Fuera de Fechas'}
                                    </p>
                                </div>
                            )}
                            
                            {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible className="mt-3">{mensaje}</Alert>}
                            {error && <Alert variant="danger" onClose={() => setError('')} dismissible className="mt-3">{error}</Alert>}

                            <div className="d-grid gap-2 mt-4">
                                <Button
                                    variant="primary"
                                    onClick={manejarAnadirAlCarrito}
                                    disabled={producto.stock <= 0}
                                >
                                    {producto.stock > 0 ? 'Añadir al Carrito' : 'Producto Agotado'}
                                </Button>
                                {esAdmin && (
                                    <Button variant="outline-secondary" onClick={() => navegar(`/editar-producto/${producto._id}`)}>
                                        Editar Producto
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default DetalleProducto;