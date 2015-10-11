
var ANIM_BAT_LEFT = 0;
var ANIM_BAT_RIGHT = 1;
var ANIM_BAT_MAX = 2;

var Enemy = function(x, y)
{
    this.sprite = new Sprite("bat.png");
    this.sprite.buildAnimation(3, 1, 88, 94, 0.3, [0, 1]);
    this.sprite.buildAnimation(3, 1, 88, 94, 0.3, [3, 4]);

    // Handle Animation Offset for all Animations.
    for(var i = 0; i < ANIM_BAT_MAX; i++)
    {
        this.sprite.setAnimationOffset(i, -35, -40);
    }

    this.width = 88;
    this.height = 94;

    this.position = new Vector2();
    this.position.set(x, y);
    this.velocity = new Vector2();

    // Randomly pick a starting direction.
    var dir = rand(0,1);
    if (dir == 0)
    {
        this.moveRight = true;
        this.sprite.setAnimation(ANIM_BAT_RIGHT);
    }
    else
    {
        this.moveRight = false;
        this.sprite.setAnimation(ANIM_BAT_LEFT);
    }

    this.pause = 0;
};

// Return a random number between to variables.
function rand(floor, ceil)
{
	return Math.floor((Math.random()*(ceil-floor))+floor);
}

Enemy.prototype.update = function(deltaTime)
{
    this.sprite.update(deltaTime);

    if(this.pause > 0)
    {
        this.pause -= deltaTime;
    }
    else
    {
        var ddx = 0; // Acceleration.

        var tx = pixelToTile(this.position.x);
        var ty = pixelToTile(this.position.y);
        var nx = (this.position.x) % TILE; // true if enemy overlaps right
        var ny = (this.position.y) % TILE; // true if enemy overlaps below
        var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
        var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
        var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
        var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

        if(this.moveRight)
        {
            if(celldiag && !cellright)
            {
                ddx = ddx + ENEMY_ACCEL; // enemy wants to go right
            }
            else
            {
                this.velocity.x = 0;
                this.moveRight = false;
                // Set Animation go letft
                this.sprite.setAnimation(ANIM_BAT_LEFT);
                this.pause = 1.0;
            }
        }

        if(!this.moveRight)
        {
            if(celldown && !cell)
            {
                ddx = ddx - ENEMY_ACCEL; // enemy wants to go left
            }
            else
            {
                this.velocity.x =0;
                this.moveRight = true;
                // Set Animation go right
                this.sprite.setAnimation(ANIM_BAT_RIGHT);
                this.pause = 1.0;
            }
        }

        this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
        this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -ENEMY_MAXDX, ENEMY_MAXDX);
    }
};

Enemy.prototype.draw = function()
{
        this.sprite.draw(context, this.position.x - worldOffsetX, this.position.y);
};
