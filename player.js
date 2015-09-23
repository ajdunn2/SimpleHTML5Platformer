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
    var tx = pixelToTile(this.position.x);
    var ty = pixelToTile(this.position.y);
    var nx = (this.position.x) % TILE;
    var ny = (this.position.y) % TILE;
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
