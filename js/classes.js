//this class will be for the blocks that slide down the screen towards the player
//each block needs the following attributes:
//  - length
//  - width
//  - fill
//  - line
//  - position (which will be randomized later on)
class Block extends PIXI.Graphics{
    constructor(color=0x0ACDFF, x=0, y=0){
        super();
        this.beginFill(color);
        this.lineStyle(2, color, 1);
        this.drawRect(0, 0, 220, 40);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        this.fwd = {x:0,y:1};
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.y += this.fwd.y * this.speed * dt;
    }
}

//bullet class from circle blast
class Bullet extends PIXI.Graphics{
    constructor(color=0xFFFFFF, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(-2, -3, 3);
        this.endFill();
        this.x = x;
        this.y = y;
        // variables
        this.fwd = {x:0,y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}