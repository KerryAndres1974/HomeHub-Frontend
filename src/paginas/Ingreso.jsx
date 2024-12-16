import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import '../hojasEstilos/Ingreso.css';
import { useState } from 'react';
import Swal from 'sweetalert2';

function Ingreso() {
    const [formularioValido, cambiarFormulario] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const goTo = useNavigate();
    const auth = useAuth();

    if(!!auth.login().accessToken){
        return <Navigate to='/Gestionar-perfil' />
    }

    async function Ingresar(e) {
        e.preventDefault();
        
        try {
            if (username !== '' && password !== '') {
                const response = await fetch('https://homehub-back-production.up.railway.app/login', {
                    method: 'POST',
                    body: JSON.stringify({ email: username, password: password }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Usuario y/o contraseña invalidos');
                }

                const { token } = await response.json();
                    
                // decodificaion del token para obtener el cargo
                const [, cargaUtil] = token.split('.');
                const cargaUtilDeco = atob(cargaUtil);
                const usuario = JSON.parse(cargaUtilDeco);

                if (response.ok){
                    auth.saveUser({ body: { accessToken: token, cargo: usuario.cargo } });
                    goTo("/");
                }

            } else {
                cambiarFormulario(false);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Algo salio mal...",
                text: error,
                showConfirmButton: true,
                allowOutsideClick: true,
                allowEnterKey: true,
            });
        }
    }

    return(
        <div className='principal-login'>
            <button className='botonH' onClick={() => goTo('/')}>Regresar</button>

            <form className='contenedor-login' onSubmit={Ingresar}>

                <h1 className='texto-login'>Inicia sesión</h1>
                <div className='contenedor-inputs'>
                    <label className='input-text'>Telefono, e-mail o usuario</label>
                    <input 
                        className='input' 
                        type='texto'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label className='input-text' style={{marginTop: '15px'}}>Contraseña</label>
                    <input 
                        className='input' 
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                <input className='btn-login' type='submit' value='Continuar' />

                {formularioValido === false && <div id='mensaje-Error'>
                    <p><b>Error: </b>Usuario y/o contraseña invalidos</p>
                </div>}

                <div className='contenedor-rutas'>
                    <li><Link to='/Recuperar' className='pestaña'>Olvide mi contraseña</Link></li>
                    <li><Link to='/Registro' className='pestaña'>Crear cuenta</Link></li>
                </div>

            </form>
        </div>
    );
}

export default Ingreso;