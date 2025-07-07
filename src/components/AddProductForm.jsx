import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    const [imagen, setImagen] = useState(null);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState('');
    const [fechaInicioDescuento, setFechaInicioDescuento] = useState('');
    const [fechaFinDescuento, setFechaFinDescuento] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const obtenerToken = () => localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        setEnviando(true);

        const token = obtenerToken();
        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión como administrador.');
            navegar('/login');
            setEnviando(false);
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', parseFloat(precio));
        formData.append('stock', parseInt(stock, 10));
        formData.append('categoria', categoria);
        if (imagen) formData.append('imagen', imagen);

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
                {/* Sección de información básica */}
                <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre:</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción:</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={descripcion} 
                        onChange={(e) => setDescripcion(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrecio">
                    <Form.Label>Precio:</Form.Label>
                    <Form.Control 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={precio} 
                        onChange={(e) => setPrecio(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStock">
                    <Form.Label>Stock:</Form.Label>
                    <Form.Control 
                        type="number" 
                        min="0" 
                        value={stock} 
                        onChange={(e) => setStock(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCategoria">
                    <Form.Label>Categoría:</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={categoria} 
                        onChange={(e) => setCategoria(e.target.value)} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImagen">
                    <Form.Label>Imagen:</Form.Label>
                    <Form.Control 
                        id="imagenInput"
                        type="file" 
                        onChange={(e) => setImagen(e.target.files[0])} 
                        accept="image/*"
                    />
                </Form.Group>

                {/* Sección de descuento (opcional) */}
                <h5 className="mt-4">Descuento (opcional)</h5>
                
                <Form.Group className="mb-3" controlId="formDescuento">
                    <Form.Label>Porcentaje de descuento:</Form.Label>
                    <Form.Control 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="100" 
                        value={porcentajeDescuento} 
                        onChange={(e) => setPorcentajeDescuento(e.target.value)} 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaInicio">
                    <Form.Label>Fecha de inicio del descuento:</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={fechaInicioDescuento} 
                        onChange={(e) => setFechaInicioDescuento(e.target.value)} 
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaFin">
                    <Form.Label>Fecha de fin del descuento:</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={fechaFinDescuento} 
                        onChange={(e) => setFechaFinDescuento(e.target.value)} 
                    />
                </Form.Group>

                {/* Botones de acción */}
                <div className="form-actions">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={enviando}
                        className="me-2"
                    >
                        {enviando ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Enviando...</span>
                            </>
                        ) : 'Agregar Producto'}
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => navegar('/')} 
                        disabled={enviando}
                    >
                        Cancelar
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AddProduct;