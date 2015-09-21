var Bullet = function(x, y){
    this.image = document.createElement("img");
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 5;
    this.velocityX = 0;
    this.velocityY = 1;
    this.image.src = "bullet.png";
}

Bullet.prototype.update = function(deltaTime)
{
    this.drawImage(this.image, this.x, this.y);
}

Bullet.prototype.draw = function()
{
    context.save();
        context.translate(this.x, this.y);
        context.drawImage(this.image, -this.width/2, -this.height/2);
    context.restore();
}
