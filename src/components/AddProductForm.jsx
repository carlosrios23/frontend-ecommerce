// frontend-ecommerce/src/AddProduct.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importar componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

const AddProduct = () => {
    const navegar = useNavigate();

    // Estados para el formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [categoria, setCategoria] = useState('');
    const [imagen, setImagen] = useState(null); // Para el archivo de imagen
    const [porcentajeDescuento, setPorcentajeDescuento] = useState('');
    const [fechaInicioDescuento, setFechaInicioDescuento] = useState('');
    const [fechaFinDescuento, setFechaFinDescuento] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false); // Estado para el spinner del botón de envío

    const obtenerToken = () => localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        setEnviando(true); // Iniciar spinner del botón

        const token = obtenerToken();
        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión como administrador.');
            navegar('/login');
            setEnviando(false);
            return;
        }

        // FormData es necesario para enviar archivos (imágenes) junto con otros datos
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', parseFloat(precio));
        formData.append('stock', parseInt(stock, 10));
        formData.append('categoria', categoria);
        if (imagen) formData.append('imagen', imagen);

        // Añadir campos de descuento si tienen valores
        if (porcentajeDescuento !== '') formData.append('porcentajeDescuento', parseFloat(porcentajeDescuento));
        if (fechaInicioDescuento !== '') formData.append('fechaInicioDescuento', fechaInicioDescuento);
        if (fechaFinDescuento !== '') formData.append('fechaFinDescuento', fechaFinDescuento);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/productos`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMensaje('Producto agregado exitosamente: ' + response.data.nombre);
            // Limpiar el formulario
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setStock('');
            setCategoria('');
            setImagen(null);
            document.getElementById('imagenInput').value = '';
            setPorcentajeDescuento('');
            setFechaInicioDescuento('');
            setFechaFinDescuento('');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al agregar el producto.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container className="add-product-container">
            <h2 className="add-product-title">Agregar Nuevo Producto</h2>
            {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                {/* Formulario completo con los mismos grupos y controles, sin estilos inline */}
                <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre:</Form.Label>
                    <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </Form.Group>
                <div className="form-actions">
                    <Button variant="primary" type="submit" disabled={enviando}>
                        {enviando ? <Spinner size="sm" /> : 'Agregar Producto'}
                    </Button>
                    <Button variant="secondary" onClick={() => navegar('/')} disabled={enviando}>
                        Cancelar
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AddProduct;