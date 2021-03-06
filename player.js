var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_SHOOT_LEFT = 6;
var ANIM_SHOOT_RIGHT = 7;
var ANIM_CLIMB = 8;
var ANIM_CLIMB_STILL = 9;
var ANIM_MAX = 10;

var PLAY_NORMAL = 0;
var PLAY_CLIMB = 1;

var Player = function()
{
    this.sprite = new Sprite("ChuckNorris.png");
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [0, 1, 2, 3, 4, 5, 6, 7]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [8, 9, 10, 11, 12]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [52, 53, 54, 55, 56, 57, 58, 59]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [60, 61, 62, 63, 64]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]); // shoot left.
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
    [79, 80, 81, 82,83, 84, 85, 86, 87, 88, 89, 90, 91, 92]); // shoot right.
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]); // climb.
    this.sprite.buildAnimation(12, 8, 165, 126, 0.05,
        [42]); // climb.

    for(var i=0; i<ANIM_MAX; i++)
    {
        this.sprite.setAnimationOffset(i, -55, -87);
    }

    this.cooldownTimer = 0;
    this.hitTimer = 0.5;

    this.playerState = PLAY_NORMAL;

    this.position = new Vector2();
    this.position.set(9 * TILE, 0 * TILE);

    this.width = 159;
    this.height = 163;

    this.velocity = new Vector2();

    this.falling = true;
    this.jumping = false;

    this.direction = LEFT;

    this.health = 6;
};

Player.prototype.update = function(deltaTime)
{
    this.sprite.update(deltaTime);

    // Player can not be hit if hitTimer > 0
    if (this.hitTimer > 0)
    {
        this.hitTimer -= deltaTime;
    }

    this.changePlayerState();

    switch(this.playerState)
    {
        case PLAY_NORMAL:
            // update normal.
            this.updateNormal(deltaTime);
            break;
        case PLAY_CLIMB:
            // update ladder.
            this.updateClimb(deltaTime);
            break;
    }

};

Player.prototype.changePlayerState = function()
{
    var tx = pixelToTile(this.position.x + 16);
    var ty = pixelToTile(this.position.y);
    var tydown = pixelToTile(this.position.y + TILE);

    if(cellAtTileCoord(LAYER_LADDERS, tx, ty) == true &&
        (keyboard.isKeyDown(keyboard.KEY_LEFT) != true) &&
        (keyboard.isKeyDown(keyboard.KEY_RIGHT) != true)
    )
    {
        //ladder
        this.playerState = PLAY_CLIMB;
    } else
    {
        this.playerState = PLAY_NORMAL;
    }


    if(keyboard.isKeyDown(keyboard.KEY_DOWN) == true)
    {
        if(cellAtTileCoord(LAYER_LADDERS, tx, tydown) == true &&
        cellAtTileCoord(LAYER_LADDERS, tx, ty) == false)
        {
            this.position.y = this.position.y + (TILE * 2);
            this.playerState = PLAY_CLIMB;
        }
    }

};

Player.prototype.draw = function()
{
    this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
};


Player.prototype.updateClimb = function(deltaTime)
{

    this.velocity.x = 0;

    var down = false;
    // Keyboard Input
    if(keyboard.isKeyDown(keyboard.KEY_UP) == true)
    {
        if(this.sprite.currentAnimation != ANIM_CLIMB)
        {
            this.sprite.setAnimation(ANIM_CLIMB);
        }
        this.position.y = Math.floor(this.position.y - (deltaTime * 100));
    }
    else if(keyboard.isKeyDown(keyboard.KEY_DOWN) == true)
    {
        if(this.sprite.currentAnimation != ANIM_CLIMB)
        {
            this.sprite.setAnimation(ANIM_CLIMB);
        }
        this.position.y = Math.floor(this.position.y + (deltaTime * 100));
        down = true;
    }
    else
    {
        if(this.sprite.currentAnimation != ANIM_CLIMB_STILL)
        {
            this.sprite.setAnimation(ANIM_CLIMB_STILL);
        }
    }

    // Collision detection.
    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    var nx = (this.position.x) % TILE; // true if player overlaps right.
    var ny = (this.position.y) % TILE; // true if player overlaps below.
    var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
    var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

    // If the player has vertical velocity, then check to see if above/below
    // platform is hit. If it is, clamp y position to stop verical velocity.

    if((celldown && !cell) || (celldiag && !cellright && nx))
    {
        // Clamp the y position to avoid falling into platform below.
        this.position.y = tileToPixel(ty);
        this.velocity.y = 0;
        this.falling = false;
        this.jumping = false;
        ny = 0;

        if(this.direction == "RIGHT")
        {
            this.sprite.setAnimation(ANIM_IDLE_RIGHT);
        }
        else if(this.direction == "LEFT")
        {
            this.sprite.setAnimation(ANIM_IDLE_LEFT);
        }

    }
};

Player.prototype.updateNormal = function(deltaTime)
{
    var left = false;
    var right = false;
    var jump = false;

    // Check keypress events.
    if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true)
    {
        left = true;
        this.direction = LEFT;
        if (this.cooldownTimer <=0)
        {
            if(this.sprite.currentAnimation != ANIM_WALK_LEFT &&
                this.jumping == false)
            {
                this.sprite.setAnimation(ANIM_WALK_LEFT);
            }
        }
        else
        {
            if(this.sprite.currentAnimation != ANIM_SHOOT_LEFT &&
                this.jumping == false)
            {
                this.sprite.setAnimation(ANIM_SHOOT_LEFT);
            }
        }
    }
    else if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true)
    {
        right = true;
        this.direction = RIGHT;
        if (this.cooldownTimer <=0)
        {
            if(this.sprite.currentAnimation != ANIM_WALK_RIGHT &&
                this.jumping == false)
            {
                this.sprite.setAnimation(ANIM_WALK_RIGHT);
            }
        }
        else
        {
            if(this.sprite.currentAnimation != ANIM_SHOOT_RIGHT &&
                this.jumping == false)
            {
                this.sprite.setAnimation(ANIM_SHOOT_RIGHT);
            }
        }
    }
    else
    {
        if(this.jumping == false && this.falling == false && this.cooldownTimer <= 0)
        {
            if(this.direction == LEFT)
            {
                if(this.sprite.currentAnimation != ANIM_IDLE_LEFT)
                {
                    this.sprite.setAnimation(ANIM_IDLE_LEFT);
                }
            }
            else
            {
                if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT)
                {
                    this.sprite.setAnimation(ANIM_IDLE_RIGHT);
                }
            }
        }
    }

    if(keyboard.isKeyDown(keyboard.KEY_UP) == true)
    {
        jump = true;
        cooldownTimer = 0;
        if(left == true)
        {
            this.sprite.setAnimation(ANIM_JUMP_LEFT);
        }
        if(right == true)
        {
            this.sprite.setAnimation(ANIM_JUMP_RIGHT);
        }
    }

    // From Audio tutorial.
    if(this.cooldownTimer > 0)
    {
        this.cooldownTimer -= deltaTime;
    }
    if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true
    && this.cooldownTimer <= 0)
    {
        sfxFire.play();
        this.cooldownTimer = 0.2;
        // Shoot a bullet.
        createABullet();
        if(this.direction == LEFT)
        {
            this.sprite.setAnimation(ANIM_SHOOT_LEFT);
        }
        else
        {
            this.sprite.setAnimation(ANIM_SHOOT_RIGHT);
        }
    }

    var wasleft = this.velocity.x < 0;
    var wasright = this.velocity.x > 0;
    var falling = this.falling;
    var ddx = 0; // Acceleration.
    var ddy = GRAVITY;

    if (left)
    {
        ddx = ddx - ACCEL;
    }
    else if (wasleft)
    {
        ddx = ddx + FRICTION;
    }
    if (right)
    {
        ddx = ddx + ACCEL;
    }
    else if (wasright)
    {
        ddx = ddx - FRICTION;
    }
    if (jump && !this.jumping && !falling)
    {
        // Apply an instantaneous (large) vertical impulse.
        ddy = ddy - JUMP;
        this.jumping = true;
        if(this.direction == LEFT)
        {
            this.sprite.setAnimation(ANIM_JUMP_LEFT)
        }
        else
        {
            this.sprite.setAnimation(ANIM_JUMP_RIGHT)
        }
    }

    // Calculate the new position and velocity.
    this.position.y = Math.floor(this.position.y + (deltaTime * this.velocity.y));
    this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
    this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
    this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);

    if((wasleft && (this.velocity.x >0)) || (wasright && (this.velocity.x < 0)))
    {
        // Clamp at 0 to prevent friction from making jiggle side to side.
        this.velocity.x = 0;
    }

    // Collision detection.
    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    var nx = (this.position.x) % TILE; // true if player overlaps right.
    var ny = (this.position.y) % TILE; // true if player overlaps below.
    var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
    var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

    // If the player has vertical velocity, then check to see if above/below
    // platform is hit. If it is, clamp y position to stop verical velocity.
    if(this.velocity.y > 0)
    {
        if((celldown && !cell) || (celldiag && !cellright && nx))
        {
            // Clamp the y position to avoid falling into platform below.
            this.position.y = tileToPixel(ty);
            this.velocity.y = 0;
            this.falling = false;
            this.jumping = false;
            ny = 0;
        }
    }
    else if(this.velocity.y < 0)
    {
        if((cell && !celldown) || (cellright && !celldiag && nx))
        {
            // Clamp y position to avoid jumping into platform above.
            this.position.y = tileToPixel(ty + 1);
            this.velocity.y = 0;
            // Player is no longer really in that cell, we clamp them to the
            // cell below.
            cell = celldown;
            cellright = celldiag;
            ny = 0;
        }
    }

    if(this.velocity.x > 0)
    {
        if((cellright && !cell) || (celldiag && !celldown && ny))
        {
            // Clamp the x position to avoid moving into the platform we
            // just hit.
            this.position.x = tileToPixel(tx);
            this.velocity.x = 0; // Stop horizontal velocity.
        }
    }
    else if(this.velocity.x < 0)
    {
        if((cell && !cellright) || (celldown && !celldiag && ny))
        {
            // Clamp the x position to avoid moving into the platform we
            // just hit.
            this.position.x = tileToPixel(tx + 1);
            this.velocity.x = 0; // Stop horizontal velocity.
        }
    }

    if(cellAtTileCoord(LAYER_OBJECT_TRIGGERS, tx, ty) == true)
    {
        // game over (do let player go over top of screen)
        if (player.position.y > 0){
            gs.setState(gs.STATE_GAMEOVER);
        }
    }

    if (player.health <= 0){
        gs.setState(gs.STATE_GAMEOVER);
    }
};
