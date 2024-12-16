import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Inputs from '../componentes/Inputs.jsx';
import '../hojasEstilos/Editarinmueble.css';
import Swal from 'sweetalert2';
import { MdCancel, MdAddHomeWork } from "react-icons/md";

export function Editarproyecto() {
    const [descripcion, setDescripcion] = useState({campo: '', valido: null});
    const [direccion, setDireccion] = useState({campo: '', valido: null});
    const [nombre, setNombre] = useState({campo: '', valido: null});
    const [precio, setPrecio] = useState({campo: '', valido: null});
    const [ciudad, setCiudad] = useState('Ciudad');
    const [tipo, setTipo] = useState('Tipo');
    const { idProyecto } = useParams();
    const [proyecto, setProyecto] = useState([]);
    const goTo = useNavigate();
    const fileInpuRef = useRef(null);

    const [imagenes, setImagenes] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [guardaImagenes, setGuardaImagenes] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(false);

    // Expresiones para formularios
    const expresiones = {
        precio: /^\d{1,3}(,\d{3})/, //precios monetarios
        direccion: /^[a-zA-ZÀ-ÿ0-9\s#-.,]{1,100}$/, //letras, numeros, # y -
        credenciales: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, // letras mayus y minus
    }

    async function eliminarImagen(index, image, idimagen) {
        
        if (image === true) {
            Swal.fire({
                icon: "question",
                title: "¿Seguro que quieres eliminar la imagen previa del proyecto?",
                showConfirmButton: true,
                showCancelButton: true,
                allowOutsideClick: false,
                allowEnterKey: false,
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",

            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`https://homehub-back-production.up.railway.app/imagenes/${idimagen}`, {
                        method: 'DELETE',
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
                        }
                    })
                    .then(() => {
                        // Manejar la respuesta exitosa aquí
                        Swal.fire({
                            icon: "success",
                            title: "Se eliminó la imagen",
                            showConfirmButton: false,
                            toast: true,
                            color: 'green',
                            position: 'top-end',
                            timer: 2000,
                        });
                        
                        setImagenes(imagenes.filter((_, i) => i !== index));
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

        } else {
            setSelectedImages(selectedImages.filter((_, i) => i !== index));
        }
    };

    // Obtiene el proyecto
    useEffect(() => {
        const cargarProyecto = async () => {
            try {
                const response = await fetch(`https://homehub-back-production.up.railway.app/proyectos/proyecto/${idProyecto}`);
    
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

        const cargarImagenes = async () => {
            try {
                const response = await fetch(`https://homehub-back-production.up.railway.app/imagenes/${idProyecto}`);

                if (response.ok) {
                    const data = await response.json();
                    setImagenes(data);
                } else {
                    console.error('Error al obtener las imagenes del proyecto:', response.statusText);
                }

            } catch (error) {
                console.error('Error al realizar la petición:', error);
            }
        }
    
        cargarProyecto();
        cargarImagenes();
    
    }, [idProyecto]);

    // Envia la peticion al backend para actualizar el proyecto
    async function editarProyecto(e) {
        e.preventDefault();
        setLoading(true);
        const formDataArray = [];
        const accion = e.nativeEvent.submitter.value;
        
        if (accion === 'Confirmar'){
            if (selectedImages.length === 0 && imagenes.length === 0) {
                Swal.fire({
                    icon: 'error',
                    text: 'Debes subir al menos una imagen!',
                    toast: true,
                    color: 'red',
                    position: 'top-end',
                    timer: 2000,
                    width: '30%',
                    showConfirmButton: false
                });

            } else if (nombre.valido === 'true' || direccion.valido === 'true' ||
                ciudad !== proyecto.ciudad || tipo !== proyecto.tipo || precio.valido === 'true' || 
                descripcion.valido === 'true') {
                
                for(let i=0; i < guardaImagenes.length; i++){
                    let files = guardaImagenes[i];
                    let formData = new FormData();
                
                    formData.append('file', files);
                    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
                    formData.append("api_key", process.env.REACT_APP_CLOUDINARY_APIKEY);
                    formData.append("timestamp", (Date.now() / 1000) | 0);
                
                    formDataArray.push(formData);
                }

                try {
                    const response = await Promise.all(formDataArray.map(formData => 
                        fetch(process.env.REACT_APP_CLOUDINARY_URL, {
                            method: 'POST',
                            body: formData
                        }).then((response) => response.json())
                    ));

                    const urlsArray = response.map(data => data.secure_url);

                    const datos = JSON.stringify(
                        Object.fromEntries(
                          Object.entries({
                            descripcion: descripcion.campo,
                            ciudad: ciudad,
                            tipo: tipo, 
                            precio: precio.campo,
                            nombre: nombre.campo,
                            direccion: direccion.campo,
                            imagenes: urlsArray
                          }).filter(([_, valor]) => valor !== '') 
                      ));

                    fetch(`https://homehub-back-production.up.railway.app/proyectos/${idProyecto}`, {
                        method: 'PUT',
                        body: datos,
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then(() => {
                        
                        Swal.fire({
                            icon: "success",
                            title: "Se guardaron los cambios Exitosamente",
                            showConfirmButton: false,
                            toast: true,
                            color: 'green',
                            position: 'top-end',
                            width: '35%',
                            timer: 3000,
                        }).then(() => window.location.reload());
                    })
                    .catch(error => {
                        console.error(error);
                    }); 

                } catch (err) {
                    console.error('Error al subir la imagene:', err);
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    text: 'Debes llenar los campos correctamente',
                    toast: true,
                    color: 'red',
                    position: 'top-end',
                    timer: 2000,
                    width: '35%',
                    showConfirmButton: false
                });
            }

        } else if (accion === 'Eliminar') {
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
                    fetch(`https://homehub-back-production.up.railway.app/proyectos/${idProyecto}`, {
                        method: 'PUT',
                        body: JSON.stringify({ estado: 'inactivo' }),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    })
                    .then(() => {

                        Swal.fire({
                            icon: "success",
                            title: "Se elimino la publicacion Exitosamente",
                            showConfirmButton: false,
                            toast: true,
                            width: '35%',
                            color: 'green',
                            position: 'top-end',
                            timer: 3000,

                        }).then(() => goTo('/Mis-publicaciones'));
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }
            })
        }
    }

    const handleFileChange = (event) => {
        const files = event.target.files;
        const nuevasImagenes = [];

        Array.from(files).forEach((file) => {
            const objectUrl = URL.createObjectURL(file);

            nuevasImagenes.push(objectUrl);

            setGuardaImagenes((prev) => {
                const existingFiles = new Set(prev); // Usamos un Set para evitar duplicados
                const newFiles = Array.from(fileInpuRef.current.files);
            
                newFiles.forEach((file) => {
                    existingFiles.add(file); // Añadimos cada archivo nuevo al Set
                });
            
                return Array.from(existingFiles); // Convertimos de nuevo a un array
            });

        });

        if (nuevasImagenes.length === files.length) {
            setSelectedImages((prev) => [...prev, ...nuevasImagenes]);
        }            
    };

    return(
        <div className='contenedorPrincipalEdicion'>
            <button className='botonH' onClick={() => window.history.back()}>Regresar</button>
            <div className='contenedorInformacionInmueble'>
                
                <form className='contenedorEditar' onSubmit={(e) => editarProyecto(e)}>
                    
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
                        <input 
                            className={`btn-editar ${loading ? 'disabled' : ''}`} 
                            type='submit' 
                            value='Confirmar'
                            disabled={loading === true}
                        />
                        <input 
                            className={`btn-eliminar ${loading ? 'disabled' : ''}`} 
                            type='submit' 
                            value='Eliminar'
                            disabled={loading === true}
                        />
                    </div>

                </form>

                <div className="contenedor-imagenes">
                    {imagenes.map((image, i) => (
                        <div 
                            key={i} 
                            style={{ position: 'relative' }}
                            onClick={() => setSelectedImage(image.imagen_url)}
                        >
                            <MdCancel 
                                className="equis"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarImagen(i, true, image.id)}}
                            />
                            <img
                                src={image.imagen_url}
                                alt={`Imagen ${i + 1} del proyecto`}
                                className="imagen-proyecto"    
                                
                            />
                        </div>
                    ))}
                    {selectedImages.map((imagen, i) =>
                        <div key={i} style={{ position: 'relative' }}>
                            <MdCancel 
                                className="equis"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarImagen(i, false)}}
                            />
                            <img 
                                src={imagen}
                                alt={`Imagen del proyecto`}
                                className="imagen-proyecto"
                            />    
                        </div>
                    )}
                    {imagenes.length + selectedImages.length < 5 && (
                        <div className="imagenV" onClick={() => fileInpuRef.current.click()}>
                            <MdAddHomeWork className="addH"/>
                        </div>  
                    )}
                    {selectedImage && 
                        <div 
                            className='imagenE'
                            onClick={() => setSelectedImage(null)}
                        >
                            <img src={selectedImage} alt="Ampliada" className='imagen' />
                        </div>
                    }
                    <input 
                        type="file" 
                        ref={fileInpuRef} 
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

            </div>
        </div>

    );
}

export default Editarproyecto;