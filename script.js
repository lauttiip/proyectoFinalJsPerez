let puntuacion = 0

let totalPreguntas = 0

let preguntasRespondidas = 0


async function cargarDatos(ruta) {
    try {
        const response = await fetch(ruta)
        if (!response.ok) {
            throw new Error(`Error al cargar ${ruta}: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error(error)
        Swal.fire({
            title: 'Error',
            text: `No se pudieron cargar las preguntas desde ${ruta}`,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        })
    }
}

async function iniciarJuego() {
    const preguntas = await cargarDatos('./preguntas.json')
    const preguntasMath = await cargarDatos('./preguntasMath.json')

    if (preguntas && preguntasMath) {
        totalPreguntas = preguntas.length + preguntasMath.length
        mostrarSeccionJuego()
        renderizarPreguntas(preguntas, 'preguntas')
        renderizarPreguntas(preguntasMath, 'preguntasMath', true)
    }
}

function mostrarSeccionJuego() {
    document.getElementById('seccion-bienvenida').style.display = 'none'
    document.getElementById('seccion-juego').style.display = 'block'
}

function renderizarPreguntas(preguntasArray, contenedorId, esMath = false) {
    const contenedor = document.getElementById(contenedorId)
    preguntasArray.forEach((preguntaObj, index) => {
        const preguntaContainer = document.createElement('div')
        preguntaContainer.classList.add('pregunta-container')

        const preguntaText = document.createElement('h3')
        preguntaText.classList.add('pregunta-text')
        preguntaText.innerText = preguntaObj.pregunta
        preguntaContainer.appendChild(preguntaText)

        const opcionesContainer = document.createElement('div')
        opcionesContainer.classList.add('opciones-container')

        preguntaObj.opciones.forEach(opcion => {
            const botonOpcion = document.createElement('button')
            botonOpcion.classList.add('opcion-btn')
            botonOpcion.innerText = opcion
            botonOpcion.addEventListener('click', () => manejarRespuesta(botonOpcion, opcion, preguntaObj.correcta, esMath))
            opcionesContainer.appendChild(botonOpcion)
        })

        preguntaContainer.appendChild(opcionesContainer)
        contenedor.appendChild(preguntaContainer)
    })
}

function manejarRespuesta(boton, opcionSeleccionada, respuestaCorrecta, esMath) {
    const esCorrecta = opcionSeleccionada.charAt(0) === respuestaCorrecta
    
    if (esCorrecta) {
        puntuacion++
        boton.classList.add('opcion-correcta')
        Swal.fire({
            title: '¡Correcto!',
            text: 'Has seleccionado la respuesta correcta.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        })
    } else {
        boton.classList.add('opcion-incorrecta')
        Swal.fire({
            title: 'Incorrecto',
            text: esMath ? 'Puedes usar la calculadora para ayudarte.' : 'Intenta nuevamente.',
            icon: 'error',
            confirmButtonText: esMath ? 'Usar Calculadora' : 'Aceptar'
        }).then(result => {
            if (esMath && result.isConfirmed) {
                mostrarCalculadora()
            }
        })
    }
    preguntasRespondidas++
    deshabilitarOpciones(boton.parentElement)
    verificarTotalPreguntasRespondidas()
}

function verificarTotalPreguntasRespondidas() {
    if (preguntasRespondidas === totalPreguntas) {
        swal.fire({
            title: "Juego Terminado",
            text: `Has respondido un total de ${puntuacion} preguntas correctas de ${totalPreguntas} posibles`,
            icon: "info",
            confirmButtonText: "Aceptar"
        })
    }
}

function deshabilitarOpciones(contenedorOpciones) {
    const botones = contenedorOpciones.querySelectorAll('.opcion-btn')
    botones.forEach(boton => {
        boton.disabled = true
    })
}

function mostrarCalculadora() {
    Swal.fire({
        title: 'Calculadora',
        html:
            '<input id="num1" type="number" class="swal2-input" placeholder="Número 1">' +
            '<input id="num2" type="number" class="swal2-input" placeholder="Número 2">' +
            '<select id="operacion" class="swal2-select">' +
                '<option value="sumar">Sumar</option>' +
                '<option value="restar">Restar</option>' +
                '<option value="multiplicar">Multiplicar</option>' +
                '<option value="dividir">Dividir</option>' +
            '</select>',
        focusConfirm: false,
        preConfirm: () => {
            const num1 = parseFloat(document.getElementById('num1').value)
            const num2 = parseFloat(document.getElementById('num2').value)
            const operacion = document.getElementById('operacion').value
            if (isNaN(num1) || isNaN(num2)) {
                Swal.showValidationMessage('Por favor, ingresa números válidos')
                return
            }
            const resultado = realizarOperacion(num1, num2, operacion)
            Swal.fire({
                title: 'Resultado',
                text: `El resultado de la operación es: ${resultado}`,
                icon: 'info',
                confirmButtonText: 'Aceptar'
            })
        }
    })
}

function realizarOperacion(num1, num2, operacion) {
    switch (operacion) {
        case 'sumar':
            return num1 + num2
        case 'restar':
            return num1 - num2
        case 'multiplicar':
            return num1 * num2
        case 'dividir':
            return num2 !== 0 ? (num1 / num2).toFixed(2) : 'Error: División por cero'
        default:
            return 'Operación no válida'
    }
}

document.getElementById('startButton').addEventListener('click', iniciarJuego)
