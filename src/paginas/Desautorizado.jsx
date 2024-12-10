import { useNavigate } from 'react-router-dom';
import '../hojasEstilos/Desautorizado.css';

function Desautorizado() {
    const goTo = useNavigate();

    return (
        <div className='contenedor-desautorizado'>
            <h1 className='titulo-des'>Acceso Denegado </h1>

            <p className='texto-des'>
                No tienes permisos para acceder a esta página.
            </p>
            <button
                onClick={() => goTo('/')}
                className='boton-des'
            >
                Regresar al Inicio
            </button>
        </div>
    );
}

export default Desautorizado;