import { useState, useEffect } from 'react';
import '../hojasEstilos/Mispublicaciones.css';
import { useNavigate } from 'react-router-dom';
import Proyecto from '../componentes/Proyectos.jsx';

function Mispublicaciones() {
  const [vacio, setVacio] = useState(false);
  const [usuario, setUsuario] = useState({});
  const [proyectos, setProyectos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const goTo = useNavigate();

  // Obtiene el token
  useEffect(() => {
    // Aquí obtén tu token JWT de alguna manera (por ejemplo, desde localStorage)
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Divide el token en sus partes: encabezado, carga útil y firma
        const [, cargaUtilBase64,] = token.split('.');

        // Decodifica la carga útil (segunda parte del token)
        const cargaUtilDecodificada = atob(cargaUtilBase64);

        // Convierte la carga útil decodificada a un objeto JavaScript
        const user = JSON.parse(cargaUtilDecodificada);
            
        // Puedes establecer el usuario en el estado
        setUsuario(user);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []);

  // Carga los proyectos del usuario
  const misProyectos = async () => {
    try {
      const response = await fetch(`http://localhost:8000/proyectos/usuario/${usuario.id}`);

      if (response.ok) {
          const data = await response.json();
          if(data.length === 0){
            setVacio(true);
          } else {
            setProyectos(data);
          }
      } else {
          console.error('Error al obtener los proyectos:', response.statusText);
      }

    } catch (error) {
      console.error('Error al realizar la petición:', error);
    }
  }

  // Botonoes para desplazarce en el carrusel
  const handleNext = () => {
    setCurrentIndex((index) => (index + 1) % (proyectos.length - 2));
  };
    
  const handlePrev = () => {
    setCurrentIndex((index) => (index - 1 + (proyectos.length - 2)) % (proyectos.length - 2));
  };      

  return (
    <div className='paginaMisPublicaciones'>

      <h1 className='tituloPublicadoX'>{usuario ? `Publicaciones hechas por ${usuario.username}` : ''}</h1>

      <div className='botones'>
        <button className='boton' onClick={misProyectos}>Mis publicaciones</button>
        <button className='boton' onClick={() => {goTo('/Publicar-Inmueble')}}>Nueva publicación</button>
        <button className='boton' onClick={() => {goTo('/')}}>Volver a Home</button>
      </div>

      <div className='contenedor-carrusel'>

        <button className={`prev ${proyectos.length <= 3 ? 'hide-button' : ''}`} 
          style={{left: '0'}} onClick={handlePrev} >&lang;</button>

        {vacio === true && <div className='carrusel-vacio'><h3>Si aun no has publicado tus proyectos, 
          ¿que esperas? Es el momento ideal para hacerlo</h3></div>}

        {vacio === false && <div className='carrusel'>
          {proyectos.map((proyecto) => (
            <article key={proyecto.id} className='carrusel-proyecto' 
              onClick={() => {goTo(`/Mis-publicaciones/Editar-inmueble/${proyecto.id}`)}}
              style={{ transform: `translateX(-${currentIndex * 430}px)` }}>

              <Proyecto
                key={proyecto.id}
                imagen={proyecto.imagen}
                nombre={proyecto.nombre}
                tipo={proyecto.tipo}
                ciudad={proyecto.ciudad}
                precio={proyecto.precio}
                direccion={proyecto.direccion}
                descripcion={proyecto.descripcion}
                coincide={true} />

            </article>
          ))}
          
        </div>}

        <button className={`next ${proyectos.length <= 3 ? 'hide-button' : ''}`} 
          style={{right: '0'}} onClick={handleNext}>&rang;</button>

      </div>

    </div>
  )
};

export default Mispublicaciones;