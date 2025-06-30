// frontend-ecommerce/src/components/SearchBar.jsx

import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

// Este componente recibirá una prop 'onSearch' que será una función
// para manejar el término de búsqueda cuando el usuario lo envíe.
function SearchBar({ onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Evita que la página se recargue
        onSearch(searchTerm); // Llama a la función onSearch pasada desde el padre
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        onSearch(''); // Limpiar la búsqueda al borrar el texto
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="Buscar productos por nombre o descripción..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    aria-label="Buscar productos"
                />
                {searchTerm && ( // Muestra el botón de limpiar solo si hay texto en la búsqueda
                    <Button variant="outline-secondary" onClick={handleClearSearch}>
                        X
                    </Button>
                )}
                <Button variant="primary" type="submit">
                    Buscar
                </Button>
            </InputGroup>
        </Form>
    );
}

export default SearchBar;