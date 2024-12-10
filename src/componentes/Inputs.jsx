import '../hojasEstilos/Inputs.css';
import { useState } from 'react';

const Inputs = ({ tipo, texto, error, expresionRegular, cambiarEstado, estado, funcion, place, id, autocom }) => {
    const [valido, setValido] = useState(null);

    const validarCampo = () => {
        if (expresionRegular) {
            const esValido = expresionRegular.test(estado.campo);
            setValido(esValido);
            cambiarEstado({...estado, valido: esValido.toString()});
        }
        if (funcion) {
            setValido(funcion());
        }
    }

    const onChange = (e) => {
        cambiarEstado({...estado, campo: e.target.value});
    }

    return (
        <div className='formulario'>
            <p className={`texto-input ${valido === false ? 'error' : 'texto-input'}`}>{texto}</p>
            <input
                id={id}
                placeholder={place}
                type={tipo}
                autoComplete={autocom}
                value={estado.campo}
                onChange={onChange}
                onBlur={() => validarCampo()}
                onKeyUp={() => validarCampo()}
                className={`input ${valido === false ? 'error' : 'input'}`} />
            <p className={`leyendaError ${valido === false ? 'error' : 'leyendaError'}`}>{error}</p>
        </div>
    );
}

export default Inputs;