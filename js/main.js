//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

//game screen
const gameScreen = new PIXI.Application(
    {
        width: 700,
        height: 500
    }
);

document.body.appendChild(gameScreen.view);
gameScreen.renderer.backgroundColor = 0xf9f9f9;

//const variables
const sceneWidth = gameScreen.view.width;
const sceneHeight = gameScreen.view.height;

//powerup booleans
let powerUpActive = false;
let multiIsActive = false;
let shieldIsActive = false;
let bulletIsActive = false;

//game start boolean
let gameStarted = false;

//player object
const player = new PIXI.Graphics();
player.beginFill(0x0ACDFF);
player.lineStyle(2, 0x0ACDFF, 1);
player.drawRect(0, 0, 40, 40);
player.endFill();
player.x = 350;
player.y = 450;

//scenes
let titleScene;//will need the title label, start button, credits button, and tutorial button
let gameScene;//will feature the actual game; will need score label, lives, and current powerup (pause button if possible)
let gameOverScene;//will need game over label, final score, and main menu button
let tutorialScene;//will need instructions for playing the game and player movement
let creditScene;//will need labels for music, used images (if any), code sources, and documentation

//labels
let scoreLabel;//set equal to score within the game loop so it is constantly updating
let titleLabel;
let gameOverLabel;
let finalScoreLabel;

//buttons
let playButton;
let homeButton;
let creditsButton;
let tutorialButton;//we will get to this if we can, if not it's okay :)

//values
let score;
let lives;//will begin as 3, but will change throughout the game
let currentPowerUp;//will be set to one of the values in the powerup list
let addToScore;//will normally be set to 1, but will change when the multiplier powerup is active
let time = 0;//time variable to hold the changing of the frames
let oldTime = time;
//num for spawning rectangles
let spawnRect = 0;

//item lists
let blocks = [];
let powerUps = ["multi", "shield", "bullet"];
let deleteQueue = [];

//alias
let stage = gameScreen.stage;

//setting up labels, buttons, scenes, and sounds
function setup(){
    //stage = gameScreen.stage;

    //styles for labels and buttons
    let labelStyle = new PIXI.TextStyle(
        {
            fill: 0x0ACDFF,
            fontSize: 70,
            fontFamily: "Major Mono Display",
            align: "center",
            stroke: 0x000000,
            strokeThickness: 3
        }
    )

    let buttonStyle = new PIXI.TextStyle(
        {
            fill: 0x0ACDFF,
            fontSize: 50,
            fontFamily: "Major Mono Display",
            stroke: 0x000000,
            strokeThickness: 3
        }
    )

    //setting up the scenes and setting invisibility
    titleScene = new PIXI.Container();
    stage.addChild(titleScene);

    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    creditScene = new PIXI.Container();
    creditScene.visible = false;
    stage.addChild(creditScene);

    tutorialScene = new PIXI.Container();
    tutorialScene.visible = false;
    stage.addChild(tutorialScene);

    //creating the title
    titleLabel = new PIXI.Text("DODGEDODGE\nDODGE!");
    titleLabel.style = labelStyle;
    titleLabel.x = 80;
    titleLabel.y = 40;
    titleScene.addChild(titleLabel);

    //creating the score label
    scoreLabel = new PIXI.Text("score:");
    scoreLabel.style = new PIXI.TextStyle(
        {
            fill: 0x000000,
            fontSize: 30,
            fontFamily: "Major Mono Display"
        } 
    )

    gameScene.addChild(scoreLabel);

    //creating the game over label
    gameOverLabel = new PIXI.Text("Game Over!")
    gameOverLabel.style = labelStyle;
    gameOverLabel.x = 350;
    gameOverLabel.y = 40;
    gameOverScene.addChild(gameOverLabel);

    //creating the final score label
    finalScoreLabel = new PIXI.Text(`Final Score: ${score}`);
    finalScoreLabel.style = new PIXI.TextStyle(
        {
            fill: 0x000000,
            fontSize: 30,
            fontFamily: "Major Mono Display"
        } 
    )
    finalScoreLabel.x = 350;
    finalScoreLabel.y = 150;
    gameOverScene.addChild(finalScoreLabel); 

    //setting up the buttons (code from circle blast)
    playButton = new PIXI.Text("PLAY");
    playButton.style = buttonStyle;
    playButton.x = 250;
    playButton.y = 270;
    playButton.interactive = true;
    playButton.buttonMode = true;
    playButton.on("pointerup", startGame); //starGame is a function reference
    playButton.on('pointerover', e => e.target.alpha = .07); //concise arrow function with no brackets
    playButton.on('pointerout', e => e.currentTarget.alpha = 1.0); //same here
    titleScene.addChild(playButton);

    homeButton = new PIXI.Text("Return to main");
    homeButton.style = buttonStyle;
    homeButton.interactive = true;
    homeButton.buttonMode = true;
    playButton.on("pointerup", backHome);
    playButton.on('pointerover', e => e.target.alpha = .6); //concise arrow function with no brackets
    playButton.on('pointerout', e => e.currentTarget.alpha = 1.0); //same here
    gameOverScene.addChild(homeButton);

    creditsButton = new PIXI.Text("CREDITS");
    creditsButton.style = buttonStyle;
    creditsButton.interactive = true;
    creditsButton.buttonMode = true;
    creditsButton.x = 200;
    creditsButton.y = 340;
    creditsButton.on("pointerup", credits);
    creditsButton.on('pointerover', e => e.target.alpha = .6); //concise arrow function with no brackets
    creditsButton.on('pointerout', e => e.currentTarget.alpha = 1.0); //same here
    titleScene.addChild(creditsButton);

    //making the player square
    gameScene.addChild(player);

    gameScreen.ticker.add(gameLoop);
}

//running setup as soon as the page loads
gameScreen.loader.onComplete.add(setup);
gameScreen.loader.load();

//starting the game
function startGame(){
    reset();
    gameScene.visible = true;
    titleScene.visible = false;
    gameOverScene.visible = false;
    gameStarted = true;
    console.log("gameScene active")
}

//running the game
function gameLoop(){
    if (!gameStarted) return;

    //calculate delta time (from circle blast)
    let dt = 1/gameScreen.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    //moving the player
    movePlayer();

    spawnRect += 1;

    //spawning rectangles
    if (spawnRect/100 == 1){
        createBlocks();
        spawnRect = 0;
    }

    //increasing the score
    for (let block of blocks){
        block.move(dt);

        if (block.y > sceneHeight){
            gameScene.removeChild(block);
            deleteQueue.push(block);
            block.isAlive = false;
        }
    }

    //checking for collisions
    for (let block of blocks){
        if (rectsIntersect(player,block)){
            if (shieldIsActive == false){
                gameScene.removeChild(block);
                gameScene.removeChild(blocks[blocks.indexOf(block)+1]);
                gameScene.removeChild(blocks[blocks.indexOf(block)+2]);
                gameScene.removeChild(blocks[blocks.indexOf(block)+3]);
                blocks = blocks.splice(blocks.indexOf(block)+1);
                deleteQueue.push(block);
                block.isAlive = false;
                lives = lives - 1;
            }
        }
    }

    //removing old blocks
    for (let b of deleteQueue){
        blocks = blocks.splice(blocks.indexOf(b));
        score = score + addToScore;
    }

    deleteQueue = [];

    //updating the scoreLabel
    scoreLabel.text = `score: ${score}`;

    if (lives <= 0){
        endGame();
        return;
    }
}

//resetting values
function reset(){
    score = 0;
    lives = 3;
    addToScore = 1;
    currentPowerUp = "";
    addToScore = 1;
    multiIsActive = false;
    bulletIsActive = false;
    shieldIsActive = false;
    blocks = [];
    deleteQueue = [];
}

//ending the game
function endGame(){
    blocks = [];
    deleteQueue = [];
    gameScene.visible = false;
    titleScene.visible = false;
    gameOverScene.visible = true;
    finalScoreLabel.text = `Final Score: ${score}`;

}

//heading back to the home menu
function backHome(){

}

//sets the labels for the credit scene
function credits(){

}

//moves the player
function movePlayer(){
    //getting the player block to follow the mouse

    let dt = 1/gameScreen.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    // #2 - Move Ship
    let mousePosition = gameScreen.renderer.plugins.interaction.mouse.global;

    let amt = 6 * dt; // at 60 FPS would move about 10% of distance per update

    //lerp (liner interpolate) the x & y values with lerp()
    let newX = lerp(player.x, mousePosition.x, amt);

    //keep the player on the screen with clamp()
    let w2 = player.width/2;
    player.x = clamp(newX, 0+w2, gameScreen.view.width - w2);
}

//makes the blocks
function createBlocks(){
    let x = getRandom(0,sceneWidth - 100);
    //let y = getRandom(0, sceneHeight);
    let b = new Block(0x0ACDFF, x, 0);
    gameScene.addChild(b);
    blocks.push(b);
}

//randomly selecting a powerup, and drawing the powerup icon on the screen
function choosePowerUp(){

}

//what to do when the shield is activated
function shieldPowerUp(){

}

//what to do when the multiplier powerup is activated
function multiPowerUp(){

}

//what to do when the bullet powerup is activated
function bulletPowerUp(){

}
