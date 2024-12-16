import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../hojasEstilos/Administracion.css';
import { MdRemoveRedEye, MdClose } from "react-icons/md";
import Proyecto from '../componentes/Proyectos.jsx';
import Swal from 'sweetalert2';

function Admin() {
    const goTo = useNavigate();
    const [view, setView] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {

        const cargarUsuarios = async () => {

            try {
                const response = await fetch('https://homehub-back-production.up.railway.app/usuarios');
    
                if (response.ok) {
                    const datos = await response.json();
                    setUsuarios(datos);
                }
            } catch (err) {
                console.error('Error al realizar la petición:', err);
            }
        }

        cargarUsuarios();
    }, []);

    async function contratar(idusuario, contrato) {
        
        Swal.fire({
            icon: 'question',
            text: contrato ? '¿Seguro de banear usuario?' : '¿Seguro de admitir usuario?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',

        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`https://homehub-back-production.up.railway.app/usuarios/${idusuario}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ admitido: !contrato }),
                    });

                    if (response.ok) {
                        await Swal.fire({
                            icon: 'success',
                            text: 'Proceso exitoso',
                            toast: true,
                            color: 'green',
                            showConfirmButton: false,
                            timer: 3000,
                            position: 'top-end',
                            timerProgressBar: true,
                        }).then(() => window.location.reload());
                    } else {
                        throw new Error('Error en la solicitud al backend');
                    }

                } catch (err) {
                    console.error('Error al realizar la petición:', err);
                }
            }
        });
    }

    async function publicaciones(idusuario, estado) {
        setView(true);
        setPropiedades([]);

        try {
            const response = await fetch(`https://homehub-back-production.up.railway.app/usuarios/propiedades/${estado}/${idusuario}`);

            if (response.ok) {
                const datos = await response.json();
                setPropiedades(datos);
            }
        } catch (err) {
            console.error('Error al realizar la petición:', err);
        }
    }

    const handleNext = () => {
        setCurrentIndex((index) => (index + 1) % (propiedades.length - 2));
    };
    
    const handlePrev = () => {
        setCurrentIndex((index) => (index - 1 + (propiedades.length - 2)) % (propiedades.length - 2));
    };

    return (
        <div className='principal-admin'>
            <button className='botonH' onClick={() => goTo('/')}>Regresar</button>
            <h1>Administración HomeHub</h1>

            <div className='contenedor-usuarios'>
                <h3>Usuarios</h3>
                <table className='tabla-usuarios'>
                    <thead>
                        <tr className='cabecera'>
                            <th className='casilla'>Usuario</th>
                            <th className='casilla'>Nombre</th>
                            <th className='casilla'>Correo</th>
                            <th className='casilla'>Telefono</th>
                            <th className='casilla'>Propiedades en Venta</th>
                            <th className='casilla'>Propiedades Vendidas</th>
                            <th className='casilla'>Propiedades Eliminadas</th>
                            <th className='casilla'>Admitido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios
                            .map((usuario) => 
                                <tr key={usuario.id} className={`fila ${usuario.id === 10 ? 'red' : ''}`}>
                                    <td className='casilla'>{usuario.username}</td>
                                    <td className='casilla'>{usuario.name}</td>
                                    <td className='casilla'>{usuario.email}</td>
                                    <td className='casilla'>{usuario.phone}</td>
                                    <td className='casilla'>
                                        {usuario.proyectos_activos === '0' ? 'Ninguna' : usuario.proyectos_activos}
                                        {usuario.proyectos_activos === '0' ? '' : 
                                            <MdRemoveRedEye className='ojito' onClick={() => publicaciones(usuario.id, 'activo')}/>}
                                    </td>
                                    <td className='casilla'>
                                        {usuario.proyectos_vendidos === '0' ? 'Ninguna' : usuario.proyectos_vendidos}
                                        {usuario.proyectos_vendidos === '0' ? '' : 
                                            <MdRemoveRedEye className='ojito' onClick={() => publicaciones(usuario.id, 'vendido')}/>}
                                    </td>
                                    <td className='casilla'>
                                        {usuario.proyectos_inactivos === '0' ? 'Ninguna' : usuario.proyectos_inactivos}
                                        {usuario.proyectos_inactivos === '0' ? '' : 
                                            <MdRemoveRedEye className='ojito' onClick={() => publicaciones(usuario.id, 'inactivo')}/>}
                                    </td>
                                    <td className='casilla'>
                                        {usuario.id !== 10 && <button onClick={() => contratar(usuario.id, usuario.admitido)}>
                                            {usuario.admitido ? 'Banear' : 'Aceptar'}
                                        </button>}
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>                
            </div>

            {view && <div className='carrusel-proy'> 
                <MdClose className='close' onClick={() => setView(false)}/>

                <button className={`prev ${propiedades.length <= 3 ? 'hide-button' : ''}`} 
                    style={{left: '0'}} onClick={handlePrev} >&lang;</button>

                {propiedades.map((proyecto) => (
                    <article key={proyecto.id} className='carrusel-proyecto'
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
                        />

                    </article>
                ))}

                <button className={`next ${propiedades.length <= 3 ? 'hide-button' : ''}`} 
                    style={{right: '0'}} onClick={handleNext}>&rang;</button>

            </div>}

        </div>
    );
}

export default Admin;