function numerosRandom(cantidadDeNumerosRandom) {
    const total = {};

    for (let i = 0; i < cantidadDeNumerosRandom; i++) {
        let numeroRandom = getRandomInt();

        if (total[numeroRandom]) {
            total[numeroRandom] = total[numeroRandom] + 1;
        } else {
            total[numeroRandom] = 1;
        }
    }

    return total;
}

function getRandomInt() {
    return (Math.floor(Math.random() * 1000) + 1);
}

process.on('exit', () => {
    console.log("Hilo terminado");
});

process.on('message', cantidadNumeros => {
    console.log("Hilo iniciado, cantidad de numeros: " + cantidadNumeros);
    const resultado = numerosRandom(cantidadNumeros);
    process.send(resultado);
    process.exit()
});

process.send('Listo');