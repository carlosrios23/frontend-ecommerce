import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// Importa los componentes de React-Bootstrap
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; // Importa el componente Spinner

function Login({ alIniciarSesion }) { // Prop para la función de inicio de sesión en App.jsx
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false); // Nuevo estado para controlar la carga
    const navegar = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        setError('');
        setCargando(true); // Inicia el estado de carga

        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
                email,
                password,
            });

            const { token, usuario } = response.data;
            const role = usuario ? usuario.role : 'user';
            localStorage.setItem('userRole', role); 


            if (typeof alIniciarSesion === 'function') {
                alIniciarSesion(token, role);
            }

            setMensaje('Inicio de sesión exitoso. ¡Bienvenido!');

            // Espera brevemente para permitir que el estado esAdmin se actualice correctamente
            setTimeout(() => {
                if (role === 'admin') {
                    window.location.assign('/agregar-producto');
                } else {
                    window.location.assign('/');
                }
            }, 100); // 100 milisegundos son suficientes

            if (role === 'admin') {
                navegar('/agregar-producto');
            } else {
                navegar('/');
            }

        } catch (err) {
            console.error('Error al iniciar sesión:', err.response?.data?.mensaje || err.message);
            setError(err.response?.data?.mensaje || 'Credenciales inválidas. Por favor, verifica tus credenciales.');
        } finally {
            setCargando(false); // Finaliza el estado de carga (éxito o error)
        }
    };

    return (
        <Container className="login-container">
            <Form onSubmit={manejarSubmit} className="login-form">
                <h2 className="login-title">Iniciar Sesión</h2>

                {mensaje && <p className="login-success-message">{mensaje}</p>}
                {error && <p className="login-error-message">{error}</p>}

                <Form.Group className="login-form-group">
                    <Form.Label htmlFor="login-email">Email:</Form.Label>
                    <Form.Control
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={cargando}
                        className="login-input"
                    />
                </Form.Group>

                <Form.Group className="login-form-group">
                    <Form.Label htmlFor="login-password">Contraseña:</Form.Label>
                    <Form.Control
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={cargando}
                        className="login-input"
                    />
                </Form.Group>

                <Button
                    type="submit"
                    className="login-submit-button"
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
                                className="login-spinner"
                            />
                            {' '}Cargando...
                        </>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </Button>

                <p className="login-register-text">
                    ¿No tienes cuenta? <a href="/registro" className="login-register-link">Regístrate</a>
                </p>
            </Form>
        </Container>
    );
}

Login.propTypes = {
    alIniciarSesion: PropTypes.func.isRequired,
};

export default Login;