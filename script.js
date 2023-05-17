// elements that will be interacted with
const gameElem = document.getElementById("game");
const scoreElem = document.getElementById("score");
const deadElem = document.getElementById("dead") 

let _styles = getComputedStyle(document.body);
// get row and columns - set in CSS for sizing manipulation
const gameRows = parseInt(_styles.getPropertyValue("--row-count"));
const gameCols = parseInt(_styles.getPropertyValue("--col-count"));
// start snake at center of the board
let coords = [[Math.floor(gameRows / 2), Math.floor(gameCols / 2)]];
let foods = [];

// dirX and dirY - the amount to move in each direction
// values are set every time the player changes the direction
let dirX = 2, dirY = 2;  // set so player can initially set any direction
let snakeLength = 3;  // initial snake length

// initialize other game variables
let score = 0;
let gameStarted = false;
let turned = true;
let runnerId;

// listen for key press
document.addEventListener("keydown", e => {
    // turned - if variable is false, game frame has not run yet to turn the snake.
    // this prevents the user from potentially turning backwards by 
    // turning twice in a single frame
    if (turned) {
        // check all directions to prevent user from turning backwards
        // each statement sets specific x and y direction
        if (dirX !== 1 && (e.key === "ArrowLeft" || e.key === "a")) {
            dirX = -1;
            dirY = 0;
            turned = false;
        } else if (dirY !== 1 && (e.key === "ArrowUp" || e.key === "w")) {
            dirX = 0;
            dirY = -1;
            turned = false;
        } else if (dirX !== -1 && (e.key === "ArrowRight" || e.key === "d")) {
            dirX = 1;
            dirY = 0;
            turned = false;
        } else if (dirY !== -1 && (e.key === "ArrowDown" || e.key === "s")) {
            dirX = 0;
            dirY = 1;
            turned = false;
        }
    }
    if (!turned && !gameStarted) {
        // starts game the first time the user presses the arrow key
        // (checks if direction is set and game has not started)
        runnerId = setInterval(moveForward, 100);  // frame every 0.09 seconds
        gameStarted = true;
    }
});

// given array arr and coordinates [x, y], checks if the coordinate [x, y]
// is found in the array
// returns: index if found, otherwise -1
function coordsIn(arr, x, y) {
    let result = -1;
    arr.forEach((c, i) => {
        // iterate through array
        if (c[0] === x && c[1] === y) {
            result = i;
            return;  // break out of loop if found
        }
    });
    return result;
}

// generates a new piece of food at a random location on the board
// returns: [x, y] location of food
function generateNewFood() {
    let x = Math.floor(Math.random() * gameCols);
    let y = Math.floor(Math.random() * gameRows);
    while (coordsIn(coords, x, y) > -1) {
        // check to prevent food from being created on top of the snake.
        // will generate new random coord until food is not on the snake
        x = Math.floor(Math.random() * gameCols);
        y = Math.floor(Math.random() * gameRows);
    }
    // add food to the board and store
    foods.push([x, y]);
    toggleFood(x, y)
    return [x, y];
}

// update score count on screen based on global score variable
function updateScoreCounter() {
    console.log(score);
    scoreElem.innerHTML = score;
}

// given [x,y], toggles a CSS class for the pixel at the coordinate
function togglePixelClass(x, y, cls) {
    let elem = gameElem.children[y].children[x];
    elem.classList.toggle(cls);
}

// toggle functions for color classes for snake body and food pixels
toggleSnakeBody = (x, y) => togglePixelClass(x, y, "snake-body");
toggleFood = (x, y) => togglePixelClass(x, y, "food");

// concludes the game, cancelling frame loop and displaying a message
function concludeGame() {
    clearInterval(runnerId);
    deadElem.style.display = "block";
}

// executes one game frame, calculating snake movement and collision logic
function moveForward() {
    // calculate new position of snake based on the "head" pixel
    let posX = coords[coords.length - 1][0];
    let posY = coords[coords.length - 1][1];
    let newX = posX + dirX;
    let newY = posY + dirY;
    if (coords.length == snakeLength) {
        // only toggle last pixel of snake if it is at its max length
        // this allows the snake to expand across frames if it eats food
        toggleSnakeBody(...coords.shift());
    }
    
    if (newX >= gameCols || newY >= gameRows || newX < 0 || newY < 0 || coordsIn(coords, newX, newY) > -1) {
        // snake has collided with game border or itself
        concludeGame();  // end game
        return;
    }
    
    if ((i = coordsIn(foods, newX, newY)) > -1) {
        // snake head just collided with a piece of food
        foods.splice(i, 1);
        score++;
        snakeLength += 3;  // add to max snake length
        toggleFood(newX, newY);  // remove food from board
        generateNewFood();  // generate new piece of food
        updateScoreCounter();  // update score on screen
    }
    
    coords.push([newX, newY]);  // store new "head" pixel
    toggleSnakeBody(newX, newY);  // toggle new "head" pixel
    turned = true;  // indicate that frame has completed for turning
    
}

// load visual game board
function loadGame() {
    // create template elements
    let pixel = document.createElement("div");
    let row = document.createElement("div");
    pixel.classList.add("game-pixel");
    row.classList.add("game-row");
    for (x = 0; x < gameRows; x++) {
        // create rows
        let r = row.cloneNode();
        gameElem.appendChild(r);
        for (y = 0; y < gameCols; y++)
            // add pixels to rows
            r.appendChild(pixel.cloneNode());
    }
    // enable first pixel in the middle
    toggleSnakeBody(coords[0][0], coords[0][1]);
    generateNewFood();  // generate first food
    gameElem.style.display = "block";  // make board visible
}

loadGame();  // start game
