import Inputs from '../componentes/Inputs.jsx';
import '../hojasEstilos/Publicarinmueble.css';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
require('dotenv').config();

function Mispublicaiones() {
  // Para publicar tu inmueble
  const [descripcion, setDescripcion] = useState({campo: '', valido: null});
  const [direccion, setDireccion] = useState({campo: '', valido: null});
  const [nombre, setNombre] = useState({campo: '', valido: null});
  const [precio, setPrecio] = useState({campo: '', valido: null});
  const [formularioValido, setFormularioValido] = useState(null);
  const [ciudad, setCiudad] = useState('Ciudad');
  const [usuario, setUsuario] = useState('');
  const [tipo, setTipo] = useState('Tipo');
  const fileInputRef = useRef(null);

  const [guardaImagenes, setGuardaImagenes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [cuentaImagenes, setCuentaImagenes] = useState(0);
  const [mensajeError, setMensajeError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  
  // Expresiones para formularios
  const expresiones = {
    precio: /^\d{1,3}(,\d{3})/, //precios monetarios
    direccion: /^[a-zA-ZÀ-ÿ0-9\s#-]{1,100}$/, //letras, numeros, # y -
    credenciales: /^[a-zA-ZÀ-ÿ\s,.]{1,100}$/, // letras mayus y minus
  };
  
  // Obtiene el token
  useEffect(() => {
    // Aquí obtén tu token JWT de alguna manera (por ejemplo, desde localStorage)
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Divide el token en sus partes: encabezado, carga útil y firma
        const [, cargaUtilBase64, ] = token.split('.');

        // Decodifica la carga útil (segunda parte del token)
        const cargaUtilDecodificada = atob(cargaUtilBase64);

        // Convierte la carga útil decodificada a un objeto JavaScript
        const usuario = JSON.parse(cargaUtilDecodificada);

        // Puedes establecer el usuario en el estado
        setUsuario(usuario);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []);

  // Mostrar imagenes en un contenedor
  const handleFileChange = (e) => {
    e.preventDefault();
    const archivosSeleccionados = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  
    if (archivosSeleccionados.length > 0) {
      if (selectedImages.length < 5) {  
        const nuevasImagenes = Array.from(archivosSeleccionados).map(URL.createObjectURL);
        
        // Para ver las imagenes en un contenedor especifico
        setSelectedImages((viejasImagenes) => [...viejasImagenes, ...nuevasImagenes]);

        // Para recoger las imagenes seleccionadas por el input
        setGuardaImagenes((viejasImagenes) => [...viejasImagenes, ...fileInputRef.current.files]);

        // Limitante de imagenes
        setCuentaImagenes((conteo) => conteo + archivosSeleccionados.length);

      } else {
        setMensajeError(true);
      }
    }
  };

  // Envia la peticion al backend para publicar el inmueble
  const publicarInmueble = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const propietario = usuario.id;
    const formDataArray = [];

    if(nombre.valido === 'true' && direccion.valido === 'true' && ciudad !== 'Ciudad' && 
    tipo !== 'Tipo' && descripcion.valido === 'true' && precio.valido === 'true' && selectedImages.length > 0){

      for(let i=0; i < guardaImagenes.length; i++){
        let files = guardaImagenes[i];
        let formData = new FormData();

        formData.append('file', files);
        formData.append("upload_preset", process.env.CLOUDINARY_PRESET);
        formData.append("api_key", process.env.CLOUDINARY_APIKEY);
        formData.append("timestamp", (Date.now() / 1000) | 0);

        formDataArray.push(formData);
      }

      try {
        const response = await Promise.all(formDataArray.map(formData => 
          fetch(process.env.CLOUDINARY_URL, {
            method: 'POST',
            body: formData
          }).then((response) => response.json())
        ));

        const urlsArray = response.map(data => data.secure_url);

        let datos = { direccion: direccion.campo,
          descripcion: descripcion.campo,
          ciudad: ciudad,
          tipo: tipo,
          precio: precio.campo,
          nombre: nombre.campo,
          idusuario: propietario,
          imagenes: urlsArray};

        let datosJSON = JSON.stringify(datos);

        fetch('http://localhost:8000/new-proyecto', {
          method: 'POST',
          body: datosJSON,
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
          setDescripcion({campo: '', valido: null});
          setDireccion({campo: '', valido: null});
          setNombre({campo: '', valido: null});
          setPrecio({campo: '', valido: null});
          setCiudad('Ciudad');
          setTipo('Tipo');
          setCuentaImagenes(0);
          setSelectedImages([]);
          setGuardaImagenes([]);
          setMensajeError(null);
          setFormularioValido(null);
          
          Swal.fire({
            icon: "success",
            title: "Publicado Exitosamente",
          });
        })
        .catch(error => {
        // Manejar errores de la solicitud aquí
        console.error('Error en la solicitud:', error);
        setFormularioValido(false);
        });
      } catch(error) {
        console.error('Error al subir la imagene:', error);
      }
    } else if (selectedImages.length > 5) {
      setMensajeError(true);
    } else {
      setFormularioValido(false);
    }

    setTimeout(() => {
      setIsLoading(false);
    }, 3000)
  };

  return(
    <div className='paginaPublicar' style={{ cursor: isLoading ? 'wait' : ''}}>

      <section className='contenedorPublicar'>

        <div 
          className='contenedorImagenesPublicacion'
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleFileChange}
          onDrop={handleFileChange}>
          
          <h1 className='tituloAñadir'>Añade fotos de tu propiedad</h1>

          <div className='contenedorImagenesSeleccionadas'>
            {selectedImages.map((image, index) => 
            (<img key={index} src={image} alt={`imagen-${index}`} className='imagenS' />))}
            {cuentaImagenes < 5 && <p className='imagenV'></p>}
          </div>

          {mensajeError === true && <p id='mensaje-Error'>No se puede agregar más de 5 imágenes!</p>}
        </div>
        
        <form className='contenedorFormulario' onSubmit={publicarInmueble}>
          
          <h1 className='textoPublicar'>Publica tu propiedad en Home Hub!</h1>
          <div className='contendedor-inputs'>
            <Inputs
              id='i1'
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
              estado={direccion}
              cambiarEstado={setDireccion}
              tipo='text'
              texto='Barrio/direccion'
              error='Ingresa una direccion valida'
              expresionRegular={expresiones.direccion}
              valido={direccion.valido}
            />

            <select className='formularioDinamico' value={ciudad}
             onChange={(e) => setCiudad(e.target.value)} id='i3' title='Ciudad'>
              <option disabled >Ciudad</option>
              <option>Cali</option>
              <option>Buga</option>
              <option>Tuluá</option>
              <option>Jamundí</option>
            </select>
          
            <select className='formularioDinamico' value={tipo}
             onChange={(e) => setTipo(e.target.value)} id='i4' title='Tipo'>
              <option disabled >Tipo</option>
              <option>Casa</option>
              <option>Apartamento</option>
            </select>

            <Inputs
              id='i5'
              estado={descripcion}
              cambiarEstado={setDescripcion}
              tipo='text'
              texto='Descripción'
              error='Campo invalido'
              expresionRegular={expresiones.credenciales}
              valido={descripcion.valido}
            />
            <Inputs
              id='i6'
              estado={precio}
              cambiarEstado={setPrecio}
              tipo='text'
              texto='Precio'
              error='Ingrese un valor valido, por ejemplo: 100,000'
              expresionRegular={expresiones.precio}
              valido={precio.valido}
            />
          </div>
          
          <input
            id='i7'
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            style={{display: 'none'}}
            ref={fileInputRef} multiple/>

          <input
            className='btn-publicar'
            value='Publicar'
            type='submit'
            style={{ cursor: isLoading ? 'wait' : ''}}
            disabled={isLoading}/>

          {formularioValido === false && <div id='mensajeError'><p>Debes llenar todos los campos</p></div>}

        </form>

      </section>
      
    </div>
  );
}

export default Mispublicaiones;