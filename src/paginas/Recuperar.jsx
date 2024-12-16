import { useAuth } from '../auth/AuthProvider.jsx';
import Inputs from '../componentes/Inputs.jsx';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import '../hojasEstilos/Recuperar.css';
import { useState } from 'react';
import Swal from 'sweetalert2';

function Recuperar() {
    const [usuario, cambiarUsuario] = useState({campo: '', valido: null});
    const [contras, cambiarContras] = useState({campo: '', valido: null});
    const [rcontra, cambiarRcontra] = useState({campo: '', valido: null});

    // Para mostrar errores y avanzar en los formularios
    const [formularioValido, setFormularioValido] = useState(null);
    const [correoValido, cambiarCorreo] = useState(null);
    const [codigoValido, cambiarCodigo] = useState(null);
    const [fase, setFase] = useState(1);

    // Para verificar si los campos de correo y codigo estan vacios o no
    const [correo, setCorreo] = useState("");
    const [codigo, setCodigo] = useState("");
    const goTo = useNavigate();
    const auth = useAuth();

    if(!!auth.login().accessToken){
        return <Navigate to='/Gestionar-perfil' />
    }

    const expresiones = { //letras, numeros, guion, guion bajo, @ y punto
        usuario: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$|^[a-zA-Z0-9_.-]+$|^[0-9]+$/,
        contraseña: /^.{4,12}$/, // de 4 a 12 digitos
    }

    const validarContraseña = () => {
        if(contras.campo.length > 0){
            if(contras.campo !== rcontra.campo){
                return false;
            } else {
                return true;
            }
        }
    }

    const onSubmits = (e) => {
        e.preventDefault();

        if(fase === 1 && correo !== ''){
            fetch('https://homehub-back-production.up.railway.app/usuarios/recuperar', {
                method: 'POST',
                body: JSON.stringify({email: correo}),
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
                console.log("Envio correo exitoso");
                cambiarCorreo(true);
                setFase(2);
            })
            .catch(error => {
                // Manejar errores de la solicitud aquí
                console.error('Error en la solicitud:', error);
                cambiarCorreo(false);
            });

        } else if (fase === 1 && correo === ''){

            console.log("correo no aceptado");
            cambiarCorreo(false);

        } else if (fase === 2 && codigo !== ''){
            fetch('https://homehub-back-production.up.railway.app/usuarios/verify-code', {
                method: 'POST',
                body: JSON.stringify({email: correo, codigo: codigo}),
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
                console.log("Envio codigo exitoso");
                cambiarCodigo(true);
                setFase(3);
            })
            .catch(error => {
                // Manejar errores de la solicitud aquí
                console.error('Error en la solicitud:', error);
                cambiarCodigo(false);
                cambiarCorreo(null);
            });

        } else if (fase === 2 && codigo === ''){

            console.log("codigo no aceptado");
            cambiarCodigo(false);
            cambiarCorreo(null);

        } else if (fase === 3 &&
                usuario.valido === 'true' &&
                contras.valido === 'true' &&
                validarContraseña() === true){

            let datos = {usuario: usuario.campo, password: contras.campo, correo: correo};
            let datosJSON = JSON.stringify(datos);
            console.log(datosJSON);

            fetch('https://homehub-back-production.up.railway.app/usuarios/reset-password', {
                method: 'POST',
                body: datosJSON,
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitude: ${response.status} ${response.statusText}`);
                }
                return response.json(); // Suponiendo que el servidor responde con JSON
            })
            .then(data => {
                // Manejar la respuesta exitosa aquí
                cambiarCodigo(null);
                Swal.fire({
                    icon: "success",
                    title: "Tu contraseña ha sido cambiada Exitosamente",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEnterKey: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => {
                    goTo('/Ingreso');
                });
            })
            .catch(error => {
                // Manejar errores de la solicitud aquí
                Swal.fire({
                    icon: "error",
                    title: "Algo salio mal...",
                    text: error,
                    showConfirmButton: false,
                    allowOutsideClick: true,
                    allowEnterKey: true,
                  });
                cambiarCodigo(null);
            });

        } else {
            setFormularioValido(false);
            cambiarCodigo(null);
        }
    }

    return(
        <div className='principal-recup'>
            <button className='botonH' onClick={() => goTo('/')}>Regresar</button>

            {fase === 1 && (<form className='contenedor-recup' onSubmit={onSubmits}>
                <h1 className='texto-recup'>Recupera tu contraseña</h1>

                <div className='contenedor-inputs'>
                    <label className='input-text'>Correo asociado a tu cuenta</label>
                    <input 
                        className='correo' 
                        type='email'
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)} />
                </div>
                
                <input className='btn-recup' type='submit' value='Enviar' />

                <div className='contenedor-final'>
                    <ul>
                        <li className='pregunta-login'>Ya tienes cuenta?</li>
                    </ul>
                    <Link to="/Ingreso" className='pestaña' >Iniciar Sesión</Link>
                </div>

                {correoValido === false && <div id='mensaje-Error'>
                    <p><b>Error: </b>Este correo no tiene cuenta asociada</p>
                </div>}

            </form>)}

            {fase === 2 && (<form className='contenedor-recup' onSubmit={onSubmits}>
                <h1 className='texto-recup'>Recupera tu contraseña</h1>

                <div className='contenedor-inputs'>
                    <label className='input-text'>Codigo de verificacion</label>
                    <input 
                        className='correo' 
                        type='text'
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    ></input>
                </div>
                
                <input className='btn-recup' type='submit' value='Enviar' />

                {correoValido === true && <div id='mensaje-Exito'>
                    <p>El codigo de verificacion fue enviado a tu correo</p>
                </div>}

                {codigoValido === false && <div id='mensaje-Error'>
                    <p>Los codigos no coinciden</p>
                </div>}

            </form>)}

            {fase === 3 && (<form className='contenedor-recup' onSubmit={onSubmits}>
                <h1 className='texto-recup'>Recupera tu contraseña</h1>

                <div className='contenedor-inputs'>
                    <Inputs
                        estado={usuario}
                        cambiarEstado={cambiarUsuario}
                        tipo='text'
                        texto='Telefono, e-mail o usuario'
                        error='Campo invalido.'
                        expresionRegular={expresiones.usuario}
                        valido={usuario.valido}
                    />

                    <Inputs
                        estado={contras}
                        cambiarEstado={cambiarContras}
                        tipo='password'
                        texto='Nueva contraseña'
                        error='la contraseña debe ser de 4 a 12 digitos.'
                        expresionRegular={expresiones.contraseña}
                        valido={contras.valido}
                    />

                    <Inputs
                        tipo='password'
                        texto='Confirmar contraseña'
                        estado={rcontra}
                        error='Ambas contraseñas deben ser iguales'
                        funcion={validarContraseña}
                        cambiarEstado={cambiarRcontra}
                        valido={rcontra.valido}
                    />
                </div>
                
                <input className='btn-recup' type='submit' value='Ingresar' />

                {codigoValido === true && <div id='mensaje-Exito'>
                    <p>El codigo de verificacion fue aceptado</p>
                </div>}

                {correoValido === false && <div id='mensajeError'>
                    <p>Usuario invalido</p>
                </div>}

                {formularioValido === false && <div id='mensajeError'>
                    <p>Debes llenar todos los campos</p>    
                </div>}

            </form>)}

        </div>
    );
}

export default Recuperar;