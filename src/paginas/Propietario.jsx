import '../hojasEstilos/Propietario.css';
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { MdPerson } from 'react-icons/md';
import Proyecto from '../componentes/Proyectos.jsx';

function Propietario() {
    const goTo = useNavigate();
    const { idusuario } = useParams();
    const [usuario, setUsuario] = useState([]);
    const [propiedades, setPropiedades] = useState([]);

    useEffect(() => {

        const cargarUsuario = async () => {
            try {
                const response = await fetch(`http://localhost:8000/usuarios/${idusuario}`);
    
                if(response.ok){
                    const dato = await response.json();
                    setUsuario(dato[0]);
                } else {
                    console.error('Error al obtener al usuario:', response.statusText);
                }
                        
            } catch (error) {
                console.error('Error al realizar la petición:', error);
            }
        }

        const cargarPropiedades = async () => {
            try {
                const response = await fetch(`http://localhost:8000/proyectos/usuario/${idusuario}`);
    
                if(response.ok){
                    const datos = await response.json();
                    setPropiedades(datos);
                } else {
                    console.error('Error al obtener propiedades:', response.statusText);
                }
                        
            } catch (error) {
                console.error('Error al realizar la petición:', error);
            }
        }

        cargarUsuario();
        cargarPropiedades();
    }, [idusuario]);

    return (
        <div className="principal-propietario">
            <button className='botonH' onClick={() => window.history.back()}>Volver a Home</button>

            <section className='seccion-propietario'>
                <p><strong>Nombre:</strong> {usuario.username}</p>
                <p><strong>Correo:</strong> {usuario.email}</p>
                <p><strong>Telefono:</strong> {usuario.phone}</p>
                <div className='fotoperfil'>
                    {usuario.fotoperfil ? <img src={usuario.fotoperfil} alt='' className='foto'/> : 
                        <MdPerson className='person'/>}
                </div>
            </section>

            <section className='seccion-propiedades'>
                {propiedades.map((proyecto) => (
                    <article 
                        key={proyecto.id} 
                        className='carrusel-proyecto' 
                        onClick={() => {goTo(`/Detalles-inmueble/${proyecto.id}`)}}
                    >

                    <Proyecto
                        key={proyecto.id}
                        imagen={proyecto.imagen}
                        nombre={proyecto.nombre}
                        tipo={proyecto.tipo}
                        ciudad={proyecto.ciudad}
                        precio={proyecto.precio}
                        direccion={proyecto.direccion}
                        descripcion={proyecto.descripcion}
                        coincide={false} />

                    </article>
                ))}
            </section>
        </div>
    );
}

export default Propietario;