// frontend-ecommerce/src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Eliminado useNavigate si no se usa directamente aquí
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token
import 'bootstrap/dist/css/bootstrap.min.css'; 
import ListaProductos from './ListaProductos'; // Renombrado de ProductList
import AddProductForm from './components/AddProductForm'; // Asumiendo este nombre
import Register from './components/Register';
import Login from './components/Login';
import Cart from './components/Cart';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute'; // Componente de ruta protegida

// Nuevos componentes que implementaremos más adelante (o que ya tienes con este nombre)
import EditProductForm from './components/EditProductForm'; // Asumiendo este nombre
import DetalleProducto from './components/DetalleProducto'; // Asumiendo este nombre

// Importa tus estilos CSS principales
import './App.css'; 

function App() {
    const [estaLogueado, setEstaLogueado] = useState(false);
    const [esAdmin, setEsAdmin] = useState(false);
    const [conteoItemsCarrito, setConteoItemsCarrito] = useState(0);

    // Función para obtener y verificar el token y el rol del usuario
    const verificarEstadoAutenticacion = useCallback(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole'); // Usamos 'userRole' aquí para consistencia

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Si el token incluye un 'role', úsalo. De lo contrario, confía en 'userRole' de localStorage.
                const roleFromToken = decodedToken.role || userRole; 
                
                setEstaLogueado(true);
                setEsAdmin(roleFromToken === 'admin');
                // Si por alguna razón el rol del token es diferente al de localStorage, actualiza localStorage
                if (roleFromToken && roleFromToken !== userRole) {
                    localStorage.setItem('userRole', roleFromToken);
                }

            } catch (error) {
                console.error("Error decodificando el token o token inválido:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('userRole'); // Limpia también userRole
                setEstaLogueado(false);
                setEsAdmin(false);
            }
        } else {
            localStorage.removeItem('token'); // Asegurarse de limpiar si no hay token
            localStorage.removeItem('userRole'); // Asegurarse de limpiar si no hay token
            setEstaLogueado(false);
            setEsAdmin(false);
        }
    }, []); // No hay dependencias externas, solo localStorage y jwtDecode

    // Se ejecuta al montar el componente para verificar el estado inicial de autenticación
    useEffect(() => {
        verificarEstadoAutenticacion();
    }, [verificarEstadoAutenticacion]);

    // Función para manejar el inicio de sesión exitoso desde el componente Login
    const manejarInicioSesion = (token, role) => { // Recibe el 'role' directamente
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role); // Guarda el 'role' en localStorage
        setEstaLogueado(true);
        setEsAdmin(role === 'admin'); // Actualiza el estado esAdmin
        // La redirección se maneja dentro del componente Login
    };

    // Función para manejar el cierre de sesión
    const manejarCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); // Elimina el 'role' del localStorage
        setEstaLogueado(false);
        setEsAdmin(false); // Reinicia esAdmin
        setConteoItemsCarrito(0); // Reinicia el contador del carrito
        // La redirección a /login se maneja dentro de Sidebar
    };

    // Función para actualizar el conteo de ítems del carrito (pasada a ListaProductos y Cart)
    const actualizarConteoItemsCarrito = (conteo) => {
        setConteoItemsCarrito(conteo);
    };

    return (
        <Router>
            {/* Sidebar ahora usa esAdmin, estaLogueado, alCerrarSesion, conteoItemsCarrito */}
            <Sidebar 
                esAdmin={esAdmin} 
                estaLogueado={estaLogueado} 
                alCerrarSesion={manejarCerrarSesion} 
                conteoItemsCarrito={conteoItemsCarrito} 
            />
            <main className="main-content">
                <Routes>
                    {/* ListaProductos ahora recibe alActualizarConteoCarrito y esAdmin */}
                    <Route 
                        path="/" 
                        element={<ListaProductos alActualizarConteoCarrito={actualizarConteoItemsCarrito} esAdmin={esAdmin} />} 
                    />
                    {/* Rutas de autenticación */}
                    <Route path="/registro" element={<Register />} />
                    <Route path="/login" element={<Login alIniciarSesion={manejarInicioSesion} />} /> {/* Pasa la función de inicio de sesión */}
                    
                    {/* Rutas protegidas para administradores */}
                    <Route 
                        path="/agregar-producto" 
                        element={<ProtectedRoute esAdmin={esAdmin}><AddProductForm /></ProtectedRoute>} 
                    />
                    <Route 
                        path="/editar-producto/:id" 
                        element={<ProtectedRoute esAdmin={esAdmin}><EditProductForm /></ProtectedRoute>} 
                    /> 

                    {/* Ruta del carrito */}
                    <Route 
                        path="/carrito" 
                        element={<Cart alActualizarConteoCarrito={actualizarConteoItemsCarrito} />} 
                    />
                    
                    {/* Ruta para la página de detalle del producto */}
                    <Route
                    path="/producto/:id"
                    element={<DetalleProducto esAdmin={esAdmin} alActualizarConteoCarrito={actualizarConteoItemsCarrito} />}
                    />
                </Routes>
            </main>
        </Router>
    );
}

export default App;