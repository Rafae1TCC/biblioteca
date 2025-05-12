import { useState } from "react";
import "./Catalog.css";
import { Link } from "react-router-dom";

function Catalog() {
  // Datos estáticos de libros
  const allBooks = [
    {
      id: 1,
      isbn: "9780307474278",
      title: "Cien años de soledad",
      author: "Gabriel García Márquez",
      year: 1967,
      pages: 471,
      description: "Una obra maestra de la literatura latinoamericana que narra la historia de la familia Buendía en el pueblo ficticio de Macondo.",
      categories: ["Ficción"],
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327881361i/320.jpg",
      available: 2
    },
    {
      id: 2,
      isbn: "9788478884456",
      title: "Harry Potter y la piedra filosofal",
      author: "J.K. Rowling",
      year: 1997,
      pages: 254,
      description: "Primer libro de la saga de Harry Potter donde el joven mago descubre su herencia mágica y comienza su educación en Hogwarts.",
      categories: ["Ficción", "Fantasía"],
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1550337333i/15868.jpg",
      available: 1
    },
    {
      id: 3,
      isbn: "9788408183611",
      title: "Sapiens: De animales a dioses",
      author: "Yuval Noah Harari",
      year: 2011,
      pages: 496,
      description: "Breve historia de la humanidad que explora cómo el Homo sapiens llegó a dominar el mundo y los grandes cambios de nuestra especie.",
      categories: ["Historia", "Ciencia"],
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
      available: 1
    },
    {
      id: 4,
      isbn: "9788467037878",
      title: "Breve historia del tiempo",
      author: "Stephen Hawking",
      year: 1988,
      pages: 256,
      description: "Explicación accesible de los conceptos fundamentales de la cosmología, desde el Big Bang hasta los agujeros negros.",
      categories: ["Ciencia", "Astronomía"],
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg",
      available: 1
    }
  ];

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Obtener todas las categorías únicas
  const allCategories = [...new Set(
    allBooks.flatMap(book => book.categories)
  )];

  // Filtrar libros según búsqueda y categoría
  const filteredBooks = allBooks.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || 
      book.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h2>Catálogo de Libros</h2>
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Buscar por título, autor o descripción..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {allCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                <img src={book.cover} alt={`Portada de ${book.title}`} />
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-meta">
                  <span>{book.year}</span>
                  <span>{book.pages} páginas</span>
                  <span className={`availability ${book.available > 0 ? 'available' : 'unavailable'}`}>
                    {book.available > 0 ? `${book.available} disponibles` : 'Agotado'}
                  </span>
                </div>
                <div className="book-categories">
                  {book.categories.map((category, index) => (
                    <span key={index} className="category-tag">{category}</span>
                  ))}
                </div>
                <p className="book-description">{book.description.substring(0, 150)}...</p>
                <div className="book-actions">
                  <Link to={`/libro/${book.id}`} className="details-btn">Ver detalles</Link>
                  {book.available > 0 && (
                    <button className="reserve-btn">Reservar</button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No se encontraron libros que coincidan con los criterios de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalog;