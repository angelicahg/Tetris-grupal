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
//Detección de colisiones-Collision detection
function collide(arena, player) {
    const m = player.matrix;
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
//The literal array, which uses square brackets.La matriz literal, que usa corchetes.
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
/*tetris forms*/ //Se visualiza de manera global en un lienzo It is displayed globally on a canvas.
function createPiece(type) {
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
//-is a type of global object used to store data. Arrays consist of a collection or ordered list that contains zero or more data types, and use numeric indexes starting at 0 to access specific elements.
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
//draw each box of the can you go

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}
//COMBINE PROPERTIES OF TWO OBJECTS TO CREATE A NEW OBJECT-COMBINA PROPIEDADES DE DOS OBJETOS PARA CREAR UN NUEVO OBJETO
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//es un método de la contexto de dibujo 2D. El método rotate () le permite rotar un objeto de dibujo en el lienzo.-it is a method of the 2D drawing context. The rotate () method allows you to rotate a drawing object on the canvas.
function rotate(matrix, dir) {
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
//draggable element  elemento de tipo arrastrable
function playerDrop() {
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
    const pieces = "TJLOSZI";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
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
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("score").innerText = player.score;
}
//it is produced by all keys, regardless of whether they are characters or not. es producido por todas las teclas, independientemente de si estas son caracteres o no.
document.addEventListener("keydown", (event) => {
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
/*shape colors*/
const colors = [
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
