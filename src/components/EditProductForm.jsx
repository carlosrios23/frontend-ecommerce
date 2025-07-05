import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Importar componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Image from 'react-bootstrap/Image'; // Para mostrar la imagen actual
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function EditProductForm() {
    const { id } = useParams();
    const navegar = useNavigate();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [imagenUrlActual, setImagenUrlActual] = useState(''); // Para la URL actual de la imagen
    const [nuevaImagenArchivo, setNuevaImagenArchivo] = useState(null); // Para el nuevo archivo de imagen seleccionado
    const [stock, setStock] = useState('');
    const [categoria, setCategoria] = useState(''); // Agregamos el estado para categoría
    // Nuevos estados para descuentos
    const [porcentajeDescuento, setPorcentajeDescuento] = useState('');
    const [fechaInicioDescuento, setFechaInicioDescuento] = useState('');
    const [fechaFinDescuento, setFechaFinDescuento] = useState('');

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    const obtenerToken = () => localStorage.getItem('token');

    // Cargar los datos del producto cuando el componente se monta
    useEffect(() => {
        const obtenerProducto = async () => {
            setCargando(true);
            setError('');
            try {
                const token = obtenerToken();
                if (!token) {
                    setError('No estás autenticado. Redirigiendo al inicio de sesión...');
                    setTimeout(() => navegar('/login'), 1500);
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/api/productos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const producto = response.data;
                setNombre(producto.nombre);
                setDescripcion(producto.descripcion);
                setPrecio(producto.precio);
                setImagenUrlActual(producto.imagen || ''); // Guarda la URL actual
                setStock(producto.stock);
                setCategoria(producto.categoria || ''); // Cargar la categoría

                // Cargar los valores de descuento existentes
                setPorcentajeDescuento(producto.porcentajeDescuento || '');
                // Formatear las fechas para el input type="date" (YYYY-MM-DD)
                setFechaInicioDescuento(producto.fechaInicioDescuento ? new Date(producto.fechaInicioDescuento).toISOString().split('T')[0] : '');
                setFechaFinDescuento(producto.fechaFinDescuento ? new Date(producto.fechaFinDescuento).toISOString().split('T')[0] : '');

            } catch (err) {
                console.error('Error al cargar el producto:', err.response?.data?.mensaje || err.message);
                setError('Error al cargar los datos del producto. Asegúrate de tener permisos.');
                if (err.response?.status === 401 || err.response?.status === 403) {
                    setTimeout(() => navegar('/login'), 1500);
                }
            } finally {
                setCargando(false);
            }
        };

        obtenerProducto();
    }, [id, navegar]);

    const manejarSubmit = async (e) => {
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
        formData.append('categoria', categoria); // Añadir categoría al formData

        // Lógica para la imagen:
        if (nuevaImagenArchivo) {
            formData.append('imagen', nuevaImagenArchivo);
        }

        // Incluir los campos de descuento
        formData.append('porcentajeDescuento', porcentajeDescuento === '' ? '' : parseFloat(porcentajeDescuento));
        formData.append('fechaInicioDescuento', fechaInicioDescuento === '' ? '' : fechaInicioDescuento);
        formData.append('fechaFinDescuento', fechaFinDescuento === '' ? '' : fechaFinDescuento);

        try {
            await axios.put(`${BACKEND_URL}/api/productos/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setMensaje('Producto actualizado exitosamente.');
            setTimeout(() => {
                setMensaje('');
                navegar('/');
            }, 2000);

        } catch (err) {
            console.error('Error al actualizar el producto:', err.response?.data?.mensaje || err.message);
            setError(err.response?.data?.mensaje || 'Error al actualizar el producto.');
            setTimeout(() => setError(''), 5000);
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <Container className="loading-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando datos del producto...</span>
                </Spinner>
                <p className="loading-text">Cargando datos del producto...</p>
            </Container>
        );
    }

    if (error && !cargando) {
        return (
            <Container className="error-container">
                <Alert className="error-alert">{error}</Alert>
                <Button className="primary-button" onClick={() => navegar('/')}>Volver a la Tienda</Button>
            </Container>
        );
    }

    return (
        <Container className="edit-product-container">
            <h2 className="edit-product-title">Editar Producto</h2>

            {mensaje && <Alert className="success-message" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
            {error && <Alert className="error-message" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Form onSubmit={manejarSubmit} className="product-form">
                <Form.Group className="form-group" controlId="formNombre">
                    <Form.Label>Nombre:</Form.Label>
                    <Form.Control
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group" controlId="formDescripcion">
                    <Form.Label>Descripción:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group" controlId="formPrecio">
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

                <Form.Group className="form-group" controlId="formStock">
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

                <Form.Group className="form-group" controlId="formCategoria">
                    <Form.Label>Categoría:</Form.Label>
                    <Form.Control
                        type="text"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="form-group" controlId="formNuevaImagen">
                    <Form.Label>Imagen del Producto:</Form.Label>
                    {imagenUrlActual && (
                        <div className="current-image-container">
                            <p>Imagen actual:</p>
                            <Image src={imagenUrlActual} alt="Imagen actual del producto" className="current-image" />
                        </div>
                    )}
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNuevaImagenArchivo(e.target.files[0])}
                        className="image-upload"
                    />
                    <Form.Text className="form-text">
                        Selecciona un nuevo archivo de imagen para reemplazar la actual.
                        Si no seleccionas nada, la imagen actual se mantendrá.
                    </Form.Text>
                </Form.Group>

                <hr className="form-divider" />
                <h4 className="discount-section-title">Configuración de Descuento (Opcional)</h4>

                <Form.Group className="form-group" controlId="formPorcentajeDescuento">
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
                    <Form.Text className="form-text">
                        Ingresa un valor entre 0 y 100. Deja vacío para no aplicar descuento.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="form-group" controlId="formFechaInicioDescuento">
                    <Form.Label>Fecha de Inicio del Descuento:</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaInicioDescuento}
                        onChange={(e) => setFechaInicioDescuento(e.target.value)}
                    />
                    <Form.Text className="form-text">
                        El descuento será válido a partir de esta fecha.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="form-group" controlId="formFechaFinDescuento">
                    <Form.Label>Fecha de Fin del Descuento:</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaFinDescuento}
                        onChange={(e) => setFechaFinDescuento(e.target.value)}
                    />
                    <Form.Text className="form-text">
                        El descuento expirará después de esta fecha.
                    </Form.Text>
                </Form.Group>

                <div className="form-actions">
                    <Button className="submit-button" type="submit" disabled={enviando}>
                        {enviando ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="submit-spinner"
                                />
                                <span className="submit-text">Guardando...</span>
                            </>
                        ) : (
                            'Actualizar Producto'
                        )}
                    </Button>
                    <Button className="cancel-button" onClick={() => navegar('/')} disabled={enviando}>
                        Cancelar
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

export default EditProductForm;