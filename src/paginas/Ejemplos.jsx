import React, { useState, useRef, useEffect } from 'react';

const Ejemplos = () => {
    const [isChildContainerVisible, setChildContainerVisible] = useState(false);

    const childContainerRef = useRef(null);
    const parentContainerRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          parentContainerRef.current &&
          !parentContainerRef.current.contains(event.target) && 
          !childContainerRef.current.contains(event.target)
        ) {
          // Cerrar el contenedor hijo si se hace clic fuera del contenedor principal
          setChildContainerVisible(false);
        }
      };
  
      // Agregar un event listener para cerrar el contenedor hijo al hacer clic fuera de él
      document.addEventListener('mousedown', handleClickOutside);
  
      // Limpiar el event listener al desmontar el componente
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const toggleChildContainer = () => {
      setChildContainerVisible(!isChildContainerVisible);
    };
  
    return (
      <div>
        <div
          ref={parentContainerRef}
          style={{
            width: '200px',
            height: '200px',
            background: 'lightblue',
            position: 'relative',
          }}
          onClick={toggleChildContainer} >
          Contenedor Principal
        </div>
        
        {isChildContainerVisible === true && (
          <div
            ref={childContainerRef}
            style={{
              width: '150px',
              height: '150px',
              background: 'lightgreen',
              position: 'absolute',
              top: '50%',
              left: '0',
              zIndex: '1',
            }} >
            Contenedor Hijo
          </div> )}
      </div>
    );
};

export default Ejemplos;
