const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20); //medidas de las fichas

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0); //Cambia el contenido de un array eliminando elementos existentes y/o agregando nuevos elementos.Change the content of an array by removing existing elements and / or adding new elements.
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    //Detección de colisiones-Collision detection
    const o = player.pos;

    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    //The literal array, which uses square brackets.La matriz literal, que usa corchetes.
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    //Se visualiza de manera global en un lienzo It is displayed globally on a canvas.
    if (type === "I") {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === "L") {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === "J") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === "O") {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === "Z") {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === "T") {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    //-is a type of global object used to store data. Arrays consist of a collection or ordered list that contains zero or more data types, and use numeric indexes starting at 0 to access specific elements.
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    //draw each box of the can you go
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    //COMBINE PROPERTIES OF TWO OBJECTS TO CREATE A NEW OBJECT-COMBINA PROPIEDADES DE DOS OBJETOS PARA CREAR UN NUEVO OBJETO
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    //es un método de la contexto de dibujo 2D. El método rotate () le permite rotar un objeto de dibujo en el lienzo.-it is a method of the 2D drawing context. The rotate () method allows you to rotate a drawing object on the canvas.
    for (let y = 0; y < matrix.length; ++y) {
        //devuelve la longitud de una cadena -returns the length of a string
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach((row) => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    //Ocurre cuando empezamos a mover un elemento de tipo arrastrable dentro de su contenedor, pero todavía no ha sido soltado, este evento se dispara cuando el elemento "arrastrable" entra dentro de la "zona para soltar"-It occurs when we start to move a draggable element inside its container, but it has not yet been dropped, this event is fired when the "draggable" element enters the "drop zone"
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }

    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = "TJLOSZI"; //parts name

    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]); //llama la pieza aleatoriamante-call the random piece
    player.pos.y = 0;
    player.pos.x =
        ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

    if (collide(arena, player)) {
        arena.forEach((row) => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    //define una transformación que gira un elemento alrededor de un punto fijo en un plano 2D sin deformarlo.-defines a transformation that rotates an element around a fixed point in a 2D plane without deforming it.
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update); // requestAnimationFrame informa al navegador que quieres realizar una animación y solicita que el navegador programe el repintado de la ventana para el próximo ciclo de animación.-requestAnimationFrame informs the browser that you want to perform an animation and requests that the browser schedule the repaint of the window for the next animation cycle.
}

function updateScore() {
    document.getElementById("score").innerText = player.score;
}

document.addEventListener("keydown", (event) => {
    //El evento keydown se produce cuando se presiona una tecla The keydown event occurs when a key is pressed
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 38) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [
    //Color palette

    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF",
];

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();
