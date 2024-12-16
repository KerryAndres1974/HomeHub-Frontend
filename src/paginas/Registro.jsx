import Inputs from '../componentes/Inputs.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import '../hojasEstilos/Registro.css';
import { useState } from 'react';

function Registro() {      
    const [nombre, cambiarNombre] = useState({campo: '', valido: null});
    const [correo, cambiarCorreo] = useState({campo: '', valido: null});
    const [usuario, cambiarUsuario] = useState({campo: '', valido: null});
    const [telefono, cambiarTelefono] = useState({campo: '', valido: null});
    const [contraseña, cambiarContraseña] = useState({campo: '', valido: null});
    const [contraseña2, cambiarContraseña2] = useState({campo: '', valido: null});
    const [terminos, cambiarTerminos] = useState(false);
    const [variable, cambiarVariable] = useState(null);
    const [formularioValido, setFormularioValido] = useState(null);
    const goTo = useNavigate();
    const auth = useAuth();

    if(!!auth.login().accessToken){
        return <Navigate to='/Gestionar-perfil' />
    }

    const expresiones = {
        usuario: /^[a-zA-Z0-9_-]{4,16}$/, //letras, numeros, guion y guion bajo
        nombre: /^[a-zA-ZÀ-ÿ\s]{1,40}$/, //letras y espacios. Pueden llevar acentos
        contraseña: /^.{4,12}$/, // de 4 a 12 digitos
        correo: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        telefono: /^\d{10,10}$/ // si o si 10 numeros
    }

    const validarContraseña = () => {
        if(contraseña.campo.length > 0){
            if(contraseña.campo !== contraseña2.campo){
                return false;
            } else {
                return true;
            }
        }
    }

    const Registrarme = (e) => {
        e.preventDefault();
        
        if(usuario.valido === 'true' &&
        nombre.valido === 'true' &&
        contraseña.valido === 'true' &&
        validarContraseña() === true &&
        correo.valido === 'true' &&
        telefono.valido === 'true' &&
        terminos){

            const datos = JSON.stringify({
                user: usuario.campo,
                name: nombre.campo,
                password: contraseña.campo,
                password2: contraseña2.campo,
                email: correo.campo,
                phone: telefono.campo
            });
            
            fetch('https://homehub-back-production.up.railway.app/usuarios', {
                method: 'POST',
                body: datos,
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
                goTo('/Ingreso');
            })
            .catch(error => {
                // Manejar errores de la solicitud aquí
                console.error('Error en la solicitud:', error);
                cambiarVariable(false);
            });

        } else {
            setFormularioValido(false);
        }
    }

    return(
        <div className='principal-registro'>
            <button className='botonH' onClick={() => goTo('/')}>Regresar</button>
            
            <form className='contenedor-registro' action='' onSubmit={Registrarme}>
                
                <h1 className='titulo-registro'>Registrate</h1>
                <div className='contenedor-inputs'>
                    <Inputs
                        id='i1'
                        estado={usuario}
                        cambiarEstado={cambiarUsuario}
                        tipo='text'
                        texto='Usuario'
                        error='El usuario debe tener mas de 4 letras, numeros y/o guion bajo.'
                        expresionRegular={expresiones.usuario}
                        valido={usuario.valido}
                    />
                    <Inputs
                        id='i2'
                        tipo='text'
                        texto='Nombre'
                        estado={nombre}
                        error='El nombre solo debe contener letras y espacios'
                        expresionRegular={expresiones.nombre}
                        cambiarEstado={cambiarNombre}
                        valido={nombre.valido}
                    />
                    <Inputs
                        id='i3'
                        tipo='password'
                        texto='Contraseña'
                        autocom='new-password'
                        estado={contraseña}
                        error='la contraseña debe ser de 4 a 12 digitos'
                        expresionRegular={expresiones.contraseña}
                        cambiarEstado={cambiarContraseña}
                        valido={contraseña.valido}
                    />
                    <Inputs
                        id='i4'
                        tipo='password'
                        texto='Confirmar contraseña'
                        autocom='new-password'
                        estado={contraseña2}
                        error='Ambas contraseñas deben ser iguales'
                        funcion={validarContraseña}
                        cambiarEstado={cambiarContraseña2}
                        valido={contraseña2.valido}
                    />
                    <Inputs
                        id='i5'
                        tipo='email'
                        texto='Correo electronico'
                        estado={correo}
                        error='Debe ser un correo valido'
                        expresionRegular={expresiones.correo}
                        cambiarEstado={cambiarCorreo}
                        valido={correo.valido}
                    />
                    <Inputs
                        id='i6'
                        tipo='tel'
                        texto='Telefono'
                        estado={telefono}
                        error='Debe ser un telefono valido'
                        expresionRegular={expresiones.telefono}
                        cambiarEstado={cambiarTelefono}
                        valido={telefono.valido}
                    />
                </div>
                
                <label className='terminos'>
                    <input id='i7'
                        type='checkbox'
                        checked={terminos}
                        onChange={(e) => {cambiarTerminos(e.target.checked)}}/>
                    Acepto los Terminos y Condiciones
                </label>
                
                <input className='btn-registro' type='submit' value='Aceptar' />

                {variable === false && <div id='mensajeError'>
                    <p><b>Error: </b>Esta dirección de correo electrónico ya está en uso</p>
                </div>}

                <div className='contenedor-final'>
                    <ul>
                        <li className='pregunta-login'>Ya tienes cuenta?</li>
                    </ul>
                    <Link to="/Ingreso" className='pestaña' >Iniciar Sesión</Link>
                </div>

                {formularioValido === false && <div id='mensajeError'><p>Debes llenar todos los campos</p></div>}

            </form>
        </div>
    );
}

export default Registro;