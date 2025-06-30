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
        formData.append('precio', parseFloat(precio)); // Asegúrate de que sea un número
        formData.append('stock', parseInt(stock, 10)); // Asegúrate de que stock sea un entero
        formData.append('categoria', categoria);
        if (imagen) {
            formData.append('imagen', imagen);
        }

        // Añadir campos de descuento si tienen valores
        if (porcentajeDescuento !== '') {
            formData.append('porcentajeDescuento', parseFloat(porcentajeDescuento));
        }
        if (fechaInicioDescuento !== '') {
            formData.append('fechaInicioDescuento', fechaInicioDescuento);
        }
        if (fechaFinDescuento !== '') {
            formData.append('fechaFinDescuento', fechaFinDescuento);
        }


        try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/productos`, formData, {
                headers: {
                    // 'Content-Type': 'multipart/form-data' es establecido automáticamente por el navegador
                    // cuando usas FormData, pero especificarlo no hace daño.
                    'Authorization': `Bearer ${token}`
                },
            });

            setMensaje('Producto agregado exitosamente: ' + response.data.nombre);
            // Limpiar el formulario
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setStock('');
            setCategoria('');
            setImagen(null); // Limpia el estado de la imagen
            // Limpiar el input de tipo file (requiere acceder al DOM directamente, o resetear el formulario)
            document.getElementById('imagenInput').value = '';
            // Limpiar campos de descuento
            setPorcentajeDescuento('');
            setFechaInicioDescuento('');
            setFechaFinDescuento('');

            // Opcional: Navegar a la página principal o de lista de productos después de añadir
            // setTimeout(() => navegar('/'), 2000);

        } catch (err) {
            console.error('Error al agregar producto:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.mensaje || 'Error al agregar el producto. Inténtalo de nuevo.');
            setTimeout(() => setError(''), 5000); // Limpiar error después de un tiempo
        } finally {
            setEnviando(false); // Detener spinner del botón
        }
    };

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Agregar Nuevo Producto</h2>

            {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
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
                    ></Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrecio">
                    <Form.Label>Precio:</Form.Label>
                    <Form.Control
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        min="0"
                        step="0.01"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formStock">
                    <Form.Label>Stock:</Form.Label>
                    <Form.Control
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min="0"
                        step="1"
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

                <Form.Group className="mb-3" controlId="imagenInput">
                    <Form.Label>Imagen del Producto:</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*" // Solo acepta archivos de imagen
                        onChange={(e) => setImagen(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                        Sube una imagen para el producto.
                    </Form.Text>
                </Form.Group>

                {/* Opcional: Campos de descuento también para el formulario de creación */}
                <hr className="my-4" />
                <h4 className="mb-3">Configuración de Descuento (Opcional)</h4>

                <Form.Group className="mb-3" controlId="formPorcentajeDescuento">
                    <Form.Label>Porcentaje de Descuento (%):</Form.Label>
                    <Form.Control
                        type="number"
                        value={porcentajeDescuento}
                        onChange={(e) => setPorcentajeDescuento(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Ej: 10 para 10%"
                    />
                    <Form.Text className="text-muted">
                        Ingresa un valor entre 0 y 100. Deja vacío para no aplicar descuento.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaInicioDescuento">
                    <Form.Label>Fecha de Inicio del Descuento:</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaInicioDescuento}
                        onChange={(e) => setFechaInicioDescuento(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                        El descuento será válido a partir de esta fecha.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFechaFinDescuento">
                    <Form.Label>Fecha de Fin del Descuento:</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaFinDescuento}
                        onChange={(e) => setFechaFinDescuento(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                        El descuento expirará después de esta fecha.
                    </Form.Text>
                </Form.Group>


                <div className="d-flex justify-content-end gap-2"> {/* Alinea botones a la derecha y añade espacio */}
                    <Button variant="primary" type="submit" disabled={enviando}>
                        {enviando ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                <span className="ms-2">Agregando...</span>
                            </>
                        ) : (
                            'Agregar Producto'
                        )}
                    </Button>
                    {/* Botón de Cancelar para volver a la página principal */}
                    <Button variant="secondary" onClick={() => navegar('/')} disabled={enviando}>
                        Cancelar
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AddProduct;