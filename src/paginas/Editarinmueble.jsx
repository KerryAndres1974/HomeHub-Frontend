import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Inputs from '../componentes/Inputs.jsx';
import '../hojasEstilos/Editarinmueble.css';
import Swal from 'sweetalert2';

export function Editarproyecto() {
    const [descripcion, setDescripcion] = useState({campo: '', valido: null});
    const [direccion, setDireccion] = useState({campo: '', valido: null});
    const [nombre, setNombre] = useState({campo: '', valido: null});
    const [precio, setPrecio] = useState({campo: '', valido: null});
    const [formularioValido, setFormularioValido] = useState(null);
    const [ciudad, setCiudad] = useState('Ciudad');
    const [tipo, setTipo] = useState('Tipo');
    const { idProyecto } = useParams();
    const [proyecto, setProyecto] = useState([]);
    const goTo = useNavigate();

    const [imagenes, setImagenes] = useState(proyecto.imagen || []);

    const eliminarImagen = (index) => {
        setImagenes(imagenes.filter((_, i) => i !== index));
    };

    // Expresiones para formularios
    const expresiones = {
        precio: /^\d{1,3}(,\d{3})/, //precios monetarios
        direccion: /^[a-zA-ZÀ-ÿ0-9\s#-]{1,40}$/, //letras, numeros, # y -
        credenciales: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // letras mayus y minus
    }

    // Obtiene el proyecto
    useEffect(() => {
        const cargarProyecto = async () => {
            try {
                const response = await fetch(`http://localhost:8000/get-proyecto/${idProyecto}`);
    
                if(response.ok){
                    const data = await response.json();
                    setProyecto(data[0]);
                } else {
                    console.error('Error al obtener los proyectos:', response.statusText);
                }
            } catch (error) {
                console.error('Error al realizar la petición:', error);
            }
        };
    
        cargarProyecto(); // Llama a la función aquí
    
    }, [idProyecto]);

    // Envia la peticion al backend para actualizar el proyecto
    const Acciones = (e) => {
        e.preventDefault();
        const accion = e.nativeEvent.submitter.value;
        
        if (accion === 'Confirmar'){
            if (nombre.valido === 'true' || direccion.valido === 'true' ||
                ciudad !== proyecto.ciudad || tipo !== proyecto.tipo || precio.valido === 'true' || 
                descripcion.valido === 'true') {
                
                fetch(`http://localhost:8000/edit-proyecto/${idProyecto}`, {
                    method: 'PUT',
                    body: JSON.stringify({descripcion: descripcion.campo,
                        ciudad: ciudad,
                        tipo: tipo, 
                        precio: precio.campo,
                        nombre: nombre.campo,
                        direccion: direccion.campo,
                        idproyecto: idProyecto}),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
                    }
                    return response.json(); // Suponiendo que el servidor responde con JSON
                })
                .then(data => {
                    // Manejar la respuesta exitosa aquí
                    Swal.fire({
                        icon: "success",
                        title: "Se guardaron los cambios Exitosamente"
                    });
                })
                .catch(error => {
                    // Manejar errores de la solicitud aquí
                    Swal.fire({
                        icon: "error",
                        title: "Algo salio mal...",
                        text: error
                      });
                });
                
            } else {
                setFormularioValido(false);
            }
        }
        else if (accion === 'Eliminar') {
            Swal.fire({
                icon: "question",
                title: "¿Seguro que quieres eliminar tu publicaion?",
                showConfirmButton: true,
                showCancelButton: true,
                allowOutsideClick: false,
                allowEnterKey: false,
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
    
                if(result.isConfirmed) {
                    fetch(`http://localhost:8000/delete-proyecto/${idProyecto}`, {
                        method: 'PUT',
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
                        }
                        return response.json(); // Suponiendo que el servidor responde con JSON
                    })
                    .then(data => {
                        // Manejar la respuesta exitosa aquí
                        Swal.fire({
                            icon: "success",
                            title: "Se elimino la publicacion Exitosamente",
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            allowEnterKey: false,
                            timer: 3000,
                        }).then(() => {
                            goTo('/Mis-publicaciones');
                        });
                    })
                    .catch(error => {
                        // Manejar errores de la solicitud aquí
                        Swal.fire({
                            icon: "error",
                            title: "Algo salio mal...",
                            text: error
                          });
                    });
                }
            })
        }
    }

    return(
        <div className='contenedorPrincipalEdicion'>

            <div className='contenedorInformacionInmueble'>

                <div className="contenedor-imagenes">
                    {(Array.isArray(proyecto.imagen) ? proyecto.imagen : []).map((image, i) => (
                        <div className="contenedor-imagen" key={i}>
                            <h1 className="contorno">x</h1>
                            <img 
                                key={i}
                                src={image}
                                alt={`Imagen ${i + 1} del proyecto`}
                                className="imagen-proyecto"    
                                onClick={() => eliminarImagen(i)}
                            />
                        </div>
                    ))}
                </div>
                
                <form className='contenedorEditar' onSubmit={(e) => Acciones(e)}>
                    
                    <h2 className='tituloEditar'>Editar tu Inmueble ID: {idProyecto}</h2>
                    <div className='contenedor-inputs'>
                        <Inputs
                            id='i1'
                            place={proyecto.nombre}
                            estado={nombre}
                            cambiarEstado={setNombre}
                            tipo='text'
                            texto='Nombre'
                            error='Campo invalido'
                            expresionRegular={expresiones.credenciales}
                            valido={nombre.valido}
                        />
                        <Inputs
                            id='i2'
                            place={proyecto.direccion}
                            estado={direccion}
                            cambiarEstado={setDireccion}
                            tipo='text'
                            texto='Barrio/direccion'
                            error='Ingrese una direccion valida'
                            expresionRegular={expresiones.direccion}
                            valido={direccion.valido}
                        />

                        <select className='formularioDinamico' value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)} id='i3' title='Ciudad'>
                            <option  >{proyecto.ciudad}</option>
                            {['Cali', 'Buga', 'Tuluá', 'Jamundí']
                            .filter((opcion) => opcion !== proyecto.ciudad) // Filtra la ciudad actual
                            .map((opcion, index) => (
                                <option key={index}>{opcion}</option>
                            ))}
                        </select>
                    
                        <select className='formularioDinamico' value={tipo}
                        onChange={(e) => setTipo(e.target.value)} id='i4' title='Tipo'>
                            <option  >{proyecto.tipo}</option>
                            {['Casa', 'Apartamento']
                            .filter((opcion) => opcion !== proyecto.tipo) // Filtra la ciudad actual
                            .map((opcion, index) => (
                                <option key={index}>{opcion}</option>
                            ))}
                        </select>

                        <Inputs
                            id='i5'
                            place={proyecto.descripcion}
                            estado={descripcion}
                            cambiarEstado={setDescripcion}
                            tipo='text'
                            texto='Descripción'
                            error='Campo invalido'
                            expresionRegular={expresiones.direccion}
                            valido={descripcion.valido}
                        />
                        <Inputs
                            id='i6'
                            place={proyecto.precio}
                            estado={precio}
                            cambiarEstado={setPrecio}
                            tipo='text'
                            texto='Precio'
                            error='Ingrese un valor valido, por ejemplo: 100,000'
                            expresionRegular={expresiones.precio}
                            valido={precio.valido}
                        />
                    </div>
                    
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                        <input className='btn-editar' type='submit' value='Confirmar' />
                        <input className='btn-eliminar' type='submit' value='Eliminar' />
                    </div>

                    {formularioValido === false && <div id='mensajeError'>
                        <p>Debes llenar todos los campos</p>
                    </div>}

                </form>
            </div>
        </div>

    );
}

export default Editarproyecto;