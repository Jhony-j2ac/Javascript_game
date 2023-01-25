const canvas  = document.querySelector("#game");
const iniGame  = document.querySelector("#IniGame");
const game = canvas.getContext("2d");



const btnUp = document.querySelector("#up");
const btnDown = document.querySelector("#down");
const btnRight = document.querySelector("#right");
const btnLeft = document.querySelector("#left");
const begin = document.querySelector("#begin");


window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);




let canvasSize;
let elementSize;
let level = 0;
let fileMaps;
let lives = 3;
let time = 0;
let timeInterval;


const playerPosition = {
    x: undefined,
    y: undefined
}


const giftPosition = {
    x: undefined,
    y: undefined
}

const enemiesPosition = [];

function startGame(){

    //mi metodo para realizarlo con vw, toca unirlo con media queries   
    /*const wSize = "35";
    canvas.style.width =`${wSize}vw`;
    canvas.style.height = `${wSize}vw`;*/

    //ajusto el tamaño del lienzo al tamaño de la ventana
    
    //se agregan vidas disponibles
   showLives();
   if(!time){
    timeInterval= setInterval( makeTime, 100);
   }
   showRecord();
   
    //determino mi unidad dentro del canvas
    elementSize = canvasSize /10 -1;
    console.log(elementSize, canvasSize);

    //Pruebas de rectangulos 
    //game.fillRect(0,0,100,100);
    //game.clearRect(0,0,50,50);

    game.font = `${elementSize}px Verdana`;
    game.textAlign = 'start';

    /*for(let i = 0; i< 10 ; i++){
        game.fillText(emojis["X"], elementSize * i,50);
    }*/
    

    //genero mapeo de objetos
    fileMaps = maps.map( map=> {
        let files = map.trim().split("\n");
        return files.map(file =>{
            return file.trim().split("");
        });
    });
    
    
    enemiesPosition.length = 0;
    game.clearRect(0,0,canvasSize, canvasSize);

    //Genero el mapa a a partir de los arreglos
    let map  = fileMaps[level];
    //console.log(map);
    for(const row in map){

        for(column in map[row]){
            let pos = Number(row) +1;
            
            let xPos = elementSize * column;
            let yPos = elementSize * pos;
            const emojiText = map[row][column];
            //se almacena la posicion inicial del jugador
            if(emojiText === "O"){
                if( typeof playerPosition.x === "undefined" ){
                    playerPosition.x = xPos;
                    playerPosition.y = yPos;
                }
            }else if(emojiText === "I"  ){
                giftPosition.x = xPos;
                giftPosition.y = yPos;
            }else if(emojiText === "X" ){
                const enemyPosition = {
                    x: xPos,
                    y: yPos
                };
                enemiesPosition.push(enemyPosition);
                
            }


            //se añade el elemento del mapa
            game.fillText(emojis[emojiText], xPos , yPos );
        }
    }
    //se renderiza el jugador
    movePlayer();
}

function showLives(){
    const vidas = document.querySelector("#vidas");
    vidas.innerHTML = "";
    const fragment= document.createDocumentFragment();
    for(let i = 0; i <= lives; i++){
        const heart = document.createElement("span");
        heart.textContent  = emojis['HEART'];
        fragment.append(heart);

    }
    vidas.append(fragment);
}



function makeTime(){
    
    const tiempo = document.querySelector("#tiempo");
    time+= 100;
    tiempo.textContent = time;
}

function movePlayer(){

    const playerX =  Math.abs(playerPosition.x).toFixed(2);
    const playerY =  Math.abs(playerPosition.y).toFixed(2);
    const enemyCollision = enemiesPosition.find((enemy)=> 
        enemy.x.toFixed(2) == playerX && enemy.y.toFixed(2) == playerY
    );
    //se valida colision con el regalo
    if(giftPosition.x.toFixed(2) == playerX &&  playerY == giftPosition.y.toFixed(2)){
        levelWin();
        return;
    }else if(enemyCollision){
        levelLose();
        return;
    }else{
        game.fillText(emojis["PLAYER"],  playerPosition.x, playerPosition.y);

    }

}

/**
 * Funcion  que genera el lienzo del canvas
 */
function setCanvasSize(  ){

    canvas.style.display = "block";
    iniGame.style.display = "none";
    if(window-innerHeight > window.innerWidth){
        canvasSize = window.innerWidth;
    }else{
        canvasSize = window.innerHeight;
    }
    canvasSize*= 0.7;
    canvasSize.toFixed(0);
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    iniGame.style.width =  canvasSize + "px";
    iniGame.style.height =  canvasSize  + "px";

    playerPosition.x = playerPosition.y = undefined;
    startGame();
}


function levelWin(){
    if(fileMaps.length > level){
        level++;
        startGame();
    }else{
        
        clearInterval( timeInterval);
        let timeOld = localStorage.getItem("record");

        const resultado = document.querySelector("#resultado");
        if(!timeOld  ||  time < timeOld ){
            localStorage.setItem("record", time);
            resultado.textContent  = "Ha batido un nuevo record";
        }else{
            resultado.textContent  = "No ha podido batir el record";
        }
        showRecord();

        //reinicio del juego
        canvas.style.display = "none";
        iniGame.style.display = "block";
        level =0;
        time =0;

        return;
    }
}

function levelLose(){
    if(lives == 0){
        lives = 3;
        level = 0;
    }else{
        lives --;
    }
    playerPosition.x = playerPosition.y = undefined;
    startGame();
}


/**
 * Genero eventos del teclado y botones para el movimiento
 */

const moveEvents = {
    moveUp: function (){
        const newPos = playerPosition.y - elementSize;
        if(newPos > 0){
            playerPosition.y = newPos ;
            startGame();
        }
    },
    moveDown: function(){
        const newPos = playerPosition.y + elementSize;
        if(newPos <= canvasSize){
            playerPosition.y = newPos;
            startGame();
        }
    },
    moveLeft: function(){
        const newPos = playerPosition.x ;
        if(newPos > 0){
            playerPosition.x = newPos - elementSize;
            startGame();
        }
    },
    moveRight: function(){
        const newPos = playerPosition.x + elementSize;
        if(newPos < (canvasSize - elementSize)){
            playerPosition.x = newPos;
            startGame();
        }
    }
}

function checkMove(ev){
    const event = {
        'ArrowUp': 'moveUp',
        'ArrowDown': 'moveDown',
        'ArrowLeft': 'moveLeft',
        'ArrowRight': 'moveRight',
    }

    if(event[ev.code]){
        moveEvents[event[ev.code]]();
    }
}

function showRecord(){
    const record = document.querySelector("#record");
    record.textContent = localStorage.getItem("record");
}

btnUp.addEventListener('click', moveEvents.moveUp);
btnDown.addEventListener('click', moveEvents.moveDown);
btnLeft.addEventListener('click', moveEvents.moveLeft);
btnRight.addEventListener('click', moveEvents.moveRight);
window.addEventListener('keydown', checkMove);
begin.addEventListener('click', setCanvasSize);




