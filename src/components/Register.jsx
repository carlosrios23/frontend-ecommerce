import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Importa los componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; // Importa el componente Spinner
import BACKEND_URL from '../config';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false); // Nuevo estado para controlar la carga
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setCargando(true); // Inicia el estado de carga

        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/registro`, {
                nombre,
                email,
                password,
            });

            const { mensaje, usuario } = response.data;

            setMessage(mensaje + ' Redirigiendo...');

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', usuario.role); // Asegúrate de guardar el rol también aquí al registrar

            if (usuario && usuario.role === 'admin') {
                navigate('/agregar-producto');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Error al registrar:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.');
        } finally {
            setCargando(false); // Finaliza el estado de carga (éxito o error)
        }
    };

    return (
        <Container className="register-container">
            <Form onSubmit={handleSubmit} className="register-form">
                <h2 className="register-title">Registro de Usuario</h2>

                {message && <p className="register-success-message">{message}</p>}
                {error && <p className="register-error-message">{error}</p>}

                <Form.Group className="register-form-group">
                    <Form.Label htmlFor="register-nombre">Nombre:</Form.Label>
                    <Form.Control
                        type="text"
                        id="register-nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={cargando}
                        className="register-input"
                    />
                </Form.Group>

                <Form.Group className="register-form-group">
                    <Form.Label htmlFor="register-email">Email:</Form.Label>
                    <Form.Control
                        type="email"
                        id="register-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={cargando}
                        className="register-input"
                    />
                </Form.Group>

                <Form.Group className="register-form-group">
                    <Form.Label htmlFor="register-password">Contraseña:</Form.Label>
                    <Form.Control
                        type="password"
                        id="register-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={cargando}
                        className="register-input"
                    />
                </Form.Group>

                <Button
                    type="submit"
                    className="register-submit-button"
                    disabled={cargando}
                >
                    {cargando ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="register-spinner"
                            />
                            {' '}Cargando...
                        </>
                    ) : (
                        'Registrarse'
                    )}
                </Button>

                <p className="register-login-text">
                    ¿Ya tienes cuenta? <a href="/login" className="register-login-link">Inicia Sesión</a>
                </p>
            </Form>
        </Container>
    );
};

export default Register;