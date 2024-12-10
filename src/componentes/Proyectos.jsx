import '../hojasEstilos/Proyectos.css';

function Proyectos(props) {
    return (
        <div className='contenedorPropiedad'>

            {props.coincide ? (<h1 className='contorno'>Editar</h1>) : 
            (props.coincide === false ? (<h1 className='contorno'>Ver Detalles</h1>) : 
            (<p className='contorno' style={{display: 'none'}}></p>))}
            
            <img
                className='imagen'
                src={props.imagen}
                alt='Foto propiedad'
            />
            <div className='contenedorTextoPropiedad'>
                <p className='recuadro'></p>
                <p className='tituloPropiedad'>{props.nombre}</p>
                <p className='textosPropiedad'>
                Se vende {props.tipo} en {props.ciudad}. 
                Ubicada en {props.direccion}, {props.descripcion}</p>
                <p className='precioPropiedad'>{props.precio}$</p>
            </div>
        </div>
    );
}

export default Proyectos;
