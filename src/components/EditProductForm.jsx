// frontend-ecommerce/src/EditProductForm.jsx

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
            // Si el usuario seleccionó un nuevo archivo, lo adjuntamos
            formData.append('imagen', nuevaImagenArchivo);
        } else {
            // Si no hay nuevo archivo, pero ya existe una URL de imagen, la enviamos
            // Esto es crucial para que el backend sepa que la imagen no debe cambiar
            // A veces, el backend necesita un indicador. Podríamos enviar 'imagen' como la URL
            // o un campo como 'mantenerImagenActual: true'
            // Por ahora, tu backend ya está configurado para manejar req.file.path.
            // Si req.file no existe (porque no se subió un nuevo archivo), no se actualizará la imagen
            // en el controlador a menos que la envíes como un campo aparte.
            // La implementación actual del backend con Multer en la ruta
            // implica que si no se envía un archivo, req.file será `undefined`.
            // Por lo tanto, no necesitamos adjuntar la `imagenUrlActual` explícitamente como 'imagen' en formData
            // a menos que tu backend lo espere para diferenciar entre "sin cambio" y "eliminar imagen".
            // Para mantener la consistencia, podríamos enviarlo si no hay nueva imagen,
            // pero el Multer.single('imagen') sobrescribirá si hay un archivo.
            // Lo más limpio es que el backend maneje si req.file existe o no.
        }

        // Incluir los campos de descuento
        formData.append('porcentajeDescuento', porcentajeDescuento === '' ? '' : parseFloat(porcentajeDescuento));
        formData.append('fechaInicioDescuento', fechaInicioDescuento === '' ? '' : fechaInicioDescuento);
        formData.append('fechaFinDescuento', fechaFinDescuento === '' ? '' : fechaFinDescuento);


        try {
            await axios.put(`${BACKEND_URL}/api/productos/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' se establece automáticamente con FormData
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
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando datos del producto...</span>
                </Spinner>
                <p className="mt-3">Cargando datos del producto...</p>
            </Container>
        );
    }

    if (error && !cargando) {
        return (
            <Container className="my-5 text-center">
                <Alert variant="danger">{error}</Alert>
                <Button variant="primary" onClick={() => navegar('/')}>Volver a la Tienda</Button>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="text-center mb-4">Editar Producto</h2>

            {mensaje && <Alert variant="success" onClose={() => setMensaje('')} dismissible>{mensaje}</Alert>}
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Form onSubmit={manejarSubmit}>
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

                <Form.Group className="mb-3" controlId="formNuevaImagen">
                    <Form.Label>Imagen del Producto:</Form.Label>
                    {imagenUrlActual && (
                        <div className="mb-2">
                            <p>Imagen actual:</p>
                            <Image src={imagenUrlActual} alt="Imagen actual del producto" fluid thumbnail style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNuevaImagenArchivo(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                        Selecciona un nuevo archivo de imagen para reemplazar la actual.
                        Si no seleccionas nada, la imagen actual se mantendrá.
                    </Form.Text>
                </Form.Group>

                {/* Nuevos campos para descuentos */}
                <hr className="my-4" /> {/* Separador visual para descuentos */}
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

                <div className="d-flex justify-content-end gap-2">
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
                                <span className="ms-2">Guardando...</span>
                            </>
                        ) : (
                            'Actualizar Producto'
                        )}
                    </Button>
                    <Button variant="secondary" onClick={() => navegar('/')} disabled={enviando}>
                        Cancelar
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

export default EditProductForm;