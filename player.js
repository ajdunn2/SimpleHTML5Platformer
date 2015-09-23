var Player = function(){
    this.image = document.createElement("img");
    this.position = new Vector2();
    this.position.set(9*TILE, 0*TILE);

    this.width = 159;
    this.height = 163;

    this.offset = new Vector2();
    this.offset.set(-55, -87);

    this.velocity = new Vector2();

    this.falling = true;
    this.jumping = false;

    this.image.src = "hero.png";
}

Player.prototype.update = function(deltaTime)
{
    var left = false;
    var right = false;
    var jump = false;

    // Check keypress events.
    if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true)
    {
        left = true;
    }
    if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true)
    {
        right = true;
    }
    if(keyboard.isKeyDown(keyboard.KEY_SPACE) == true)
    {
        jump = true;
    }

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


    // Collision detection.
    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    var nx = (this.position.x) % TILE; // true if player overlaps right.
    var ny = (this.position.y) % TILE; // true if player overlaps below.
    var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
    var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
}

Player.prototype.draw = function()
{
    context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.drawImage(this.image, -this.width/2, -this.height/2);
    context.restore();
}
