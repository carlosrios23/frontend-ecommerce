// frontend-ecommerce/src/components/Cart.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importo los componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const Cart = ({ onCartUpdate }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('token');

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const token = getToken();
            if (!token) {
                setError('Debes iniciar sesión para ver tu carrito.');
                setLoading(false);
                if (typeof onCartUpdate === 'function') {
                    onCartUpdate(0);
                }
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/carrito`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCart(response.data);
            if (typeof onCartUpdate === 'function') {
                onCartUpdate(response.data.items.length);
            }
        } catch (err) {
            console.error('Error al cargar el carrito:', err);
            const errorMessage = err.response?.data?.mensaje || 'Error al cargar el carrito.';
            setError(errorMessage);
            if (typeof onCartUpdate === 'function') {
                onCartUpdate(0);
            }
            if (err.response?.status === 401) {
                 setError(errorMessage + ' Redirigiendo al inicio de sesión...');
                 setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, onCartUpdate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateCartItem = async (productId, newQuantity) => {
        const token = getToken();
        if (!token) {
            setError('Debes iniciar sesión para modificar tu carrito.');
            navigate('/login');
            return;
        }

        setError('');
        setMessage('');

        try {
            if (newQuantity <= 0) {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/carrito/items/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Producto eliminado del carrito.');
            } else {
                await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/carrito/items/${productId}`,
                    { cantidad: newQuantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage('Cantidad actualizada.');
            }
            await fetchCart();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error al actualizar/eliminar producto:', err);
            setError(err.response?.data?.mensaje || 'Error al actualizar el carrito.');
            if (err.response?.data?.mensaje.includes('stock')) {
            fetchCart(); // Forzar recarga para mostrar stock actual
    }
        }
    };

    const handleCheckout = async () => {
        const token = getToken();
        if (!token) {
            setError('Debes iniciar sesión para completar la compra.');
            navigate('/login');
            return;
        }

        if (!cart || cart.items.length === 0) {
            setError('El carrito está vacío. Agrega productos antes de comprar.');
            return;
        }

        if (window.confirm('¿Estás seguro de que quieres realizar la compra?')) {
            setError('');
            setMessage('');
            try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/carrito`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMessage(response.data.mensaje || 'Compra realizada con éxito.');
                setCart({ ...cart, items: [] });
                if (typeof onCartUpdate === 'function') {
                    onCartUpdate(0);
                }
                setTimeout(() => {
                    setMessage('');
                    navigate('/');
                }, 2000);
            } catch (err) {
                console.error('Error al realizar la compra:', err);
                setError(err.response?.data?.mensaje || 'Error al realizar la compra.');
                await fetchCart();
                setTimeout(() => setError(''), 5000);
            }
        }
    };

    return (
        <Container className="my-4">
            <h2 className="text-center mb-4">Tu Carrito de Compras</h2>

            {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando carrito...</span>
                    </Spinner>
                    <p className="ms-3">Cargando carrito...</p>
                </div>
            ) : (
                !cart || cart.items.length === 0 ? (
                    <div className="text-center mt-5">
                        <h3>Tu carrito está vacío.</h3>
                        <p>¡Parece que aún no has añadido ningún producto!</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Ir a la Tienda
                        </Button>
                    </div>
                ) : (
                    <div className="cart-content">
                        {/* Se asegura que thead, tbody, tfoot sean hijos directos de Table */}
                        <Table striped bordered hover responsive className="cart-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Precio Unitario</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.items.map(item => (
                                    <tr key={item.productoId}>
                                        <td>{item.nombre}</td>
                                        <td>${item.precio.toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateCartItem(item.productoId, item.cantidad - 1)}
                                                    disabled={item.cantidad <= 1}
                                                >-</Button>
                                                <span className="mx-2">{item.cantidad}</span>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => updateCartItem(item.productoId, item.cantidad + 1)}
                                                >+</Button>
                                            </div>
                                        </td>
                                        <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => updateCartItem(item.productoId, 0)}
                                            >
                                                Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Total a pagar:</td>
                                    <td className="fw-bold">${cart.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>

                        <div className="text-end mt-4">
                            <Button variant="success" size="lg" onClick={handleCheckout}>
                                Realizar Compra
                            </Button>
                        </div>
                    </div>
                )
            )}
        </Container>
    );
};

export default Cart;