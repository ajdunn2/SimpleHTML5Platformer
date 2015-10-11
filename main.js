var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();

		// Find the delta time (dt) - the change in time since the last drawFrame
		// We need to modify the delta time to something we can use.
		// We want 1 to represent 1 second, so if the delta is in milliseconds
		// we divide it by 1000 (or multiply by 0.001). This will make our
		// animations appear at the right speed, though we may need to use
		// some large values to get objects movement and rotation correct
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;

		// validate that the delta is within range
	if(deltaTime > 1)
		deltaTime = 1;

	return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

// Tile set constants.
var LAYER_COUNT = 3; // Num of layers in map.
var MAP = {tw:60, th:15}; // How big level is in tiles.
var TILE = 35; // Width/height of tile.
var TILESET_TILE = TILE * 2; // Images are twice as the grid in our map.
var TILESET_PADDING = 2; // Border.
var TILESET_SPACING = 2; // Pixels between tile images in tile map.
var TILESET_COUNT_X = 14; // Columns in the tileset.
var TILESET_COUNT_Y = 14; // Rows in tje tileset.

// Utility constants.
var LAYER_COUNT = 3;
var LAYER_BACKGROUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

// Forces constants.
var METER = TILE; // 1m.
var GRAVITY = METER * 9.8 * 6; // Exaggerated gravity (x6).
var MAXDX =  METER * 10; // Max horizontal speed (10 tiles /sec).
var MAXDY = METER * 15; // Max vertical speed (15 tiles /sec).
var ACCEL = MAXDX * 2; // Horizontal acceleration. Take 1/2 sec to reach MAXDX
var FRICTION = MAXDX * 6; // Take 1/6 sec to stop from MAXDX.
var JUMP = METER * 1500;

// Enemy constants.
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;

var LAYER_COUNT = 3;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;

var LAYER_OBJECT_ENEMIES = 3;
var LAYER_OBJECT_TRIGGERS = 4;

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a
// constant speed)
var showfps = false;
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

// load an image to draw
var crt = document.createElement("img");
crt.src = "img/crt.png";

var player = new Player();
var keyboard = new Keyboard();
var gs = new GameState();

var enemies = [];

var bullets = [];

// Load the image to use for level tiles.
var tileset = document.createElement("img");
tileset.src = "tileset.png";

var heartBox = document.createElement("img");
heartBox.src = "img/heart00.png";
var fullHeart = document.createElement("img");
fullHeart.src = "img/heart01.png";
var halfHeart = document.createElement("img");
halfHeart.src = "img/heart02.png";

// load an image to draw
var chuckNorris = document.createElement("img");
chuckNorris.src = "hero.png";

// My variables.
var gameOverTimer = 0;

var worldOffsetX = 0;

// UI variables
var score = 0;

// Utility functions.
function  cellAtPixelCoord(layer, x, y)
{
    if(x < 0 || x > SCREEN_WIDTH || y < 0)
    {
        return 1;
    }
    // Let the plater drop of the bottom of the screen.
    if(y > SCREEN_WIDTH)
    {
        return 0;
    }
    return cellAtPixelCoord(layer, p2t(x), p2t(y));
};

function cellAtTileCoord(layer, tx, ty)
{
    if(tx < 0 || tx > MAP.tw || ty < 0)
    {
        return 1;
    }
    // Let the plater drop of the bottom of the screen.
    if(ty >= MAP.th)
    {
        return 0;
    }
    return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
    return tile * TILE;
};

function pixelToTile(pixel)
{
    return Math.floor(pixel/TILE);
}

function bound(value, min, max)
{
    if(value < min)
    {
        return min;
    }
    if(value > max)
    {
        return max;
    }
    return value;
}

function drawMap()
{
		// Scrolling the level.
		var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
		var tileX = pixelToTile(player.position.x);
		var offsetX = TILE + Math.floor(player.position.x % TILE);

		startX = tileX - Math.floor(maxTiles / 2);

		if(startX < -1)
		{
				startX = 0;
				offsetX = 0;
		}
		if(startX > MAP.tw - maxTiles)
		{
			startX = MAP.tw - maxTiles + 1;
			offsetX = TILE;
		}

		worldOffsetX = startX * TILE + offsetX;

		// Draw the Map.
    for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
    {
        for(var y = 0; y < level1.layers[layerIdx].height; y++)
        {
			var idx = y * level1.layers[layerIdx].width + startX;

            for(var x = startX; x < startX + maxTiles; x++)
            {
                if(level1.layers[layerIdx].data[idx] != 0)
                {
                    // The tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
					// so subtract one from the tileset id to get the correct tile.
                    var tileIndex = level1.layers[layerIdx].data[idx] - 1;
                    var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
                    var sy = TILESET_PADDING + (Math.floor(tileIndex/TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
					context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, (x-startX) * TILE - offsetX, (y-1) * TILE, TILESET_TILE, TILESET_TILE);
                }
                idx++;
            }
        }
    }
}

var cells = [];
function initialize()
{
    for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++)
    {
        cells[layerIdx] = [];
        var idx = 0;
        for(var y = 0; y < level1.layers[layerIdx].height; y++)
        {
            cells[layerIdx][y] = [];
            for(var x = 0; x < level1.layers[layerIdx].width; x++)
            {
                if(level1.layers[layerIdx].data[idx] != 0)
                {
                    // For each tile we find in the layer data we need to create 4 collisions
                    // because our collision squares are 35x35 but the tile in the
                    // level are 70x70.
                    cells[layerIdx][y][x] = 1;
                    cells[layerIdx][y-1][x] = 1;
                    cells[layerIdx][y-1][x+1] = 1;
                    cells[layerIdx][y][x+1] = 1;
                }
                else if(cells[layerIdx][y][x] != 1)
                {
                    // If we haven't set this cell's value, then set it to 0 now.
                    cells[layerIdx][y][x] = 0;
                }
                idx++;
            }
        }
    }

    // Add enemies
    idx = 0;
    for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++)
    {
        for(var x = 0; x <level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
        {
            if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0)
            {
                var px = tileToPixel(x);
                var py = tileToPixel(y);
                var e = new Enemy(px, py);
                enemies.push(e);
            }
            idx++;
        }
    }

    // initialize trigger layer in collison map
    cells[LAYER_OBJECT_TRIGGERS] = [];
    idx = 0;
    for(var y = 0; y < level1.layers[LAYER_OBJECT_TRIGGERS].height; y++)
    {
        cells[LAYER_OBJECT_TRIGGERS][y] = [];
        for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++)
        {
            if(level1.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0)
            {
                cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y-1][x] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y-1][x+1] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y][x+1] = 1;
            }
            else if (cells[LAYER_OBJECT_TRIGGERS][y][x] != 1)
            {
                // if we haven't set this cell's value, then set it to 0 now
                cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
            }
            idx++;
        }
    }


    musicBackground = new Howl(
    {
        urls: ['background.ogg'],
        loop: true,
        buffer: true,
        volume: 0.5
    });

    musicBackground.play();

    sfxFire = new Howl(
    {
        urls: ['fireEffect.ogg'],
        buffer: true,
        volume: 1,
        onend: function() {
            isSfxPlaying = false;
        }
    });

}

// Test to see if 2 rectangles intersect.
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 || x2 + w2 < x1 || x2 > x1 + w1 || y2 > y1 + h1)
	{
		return false;
	}
	return true;
}

// Helper function to show collisions.
function drawCollisions(drawCol)
{
    // Draw red boxes.
    if (drawCol)
    {
        // Draw the player collisions.
        context.fillStyle = "#FF0";
        context.fillRect(player.position.x, player.position.y, TILE, TILE);

        // Draw the collision map.
        context.fillStyle = "#f00";
        for (var i = 0; i < cells.length; ++i)
        {
            if (i != 1) continue;
            var layer = cells[i];
            for (var y = 0; y < layer.length; ++y)
            {
                var row = layer[y];
                for (var x = 0; x < row.length; ++x)
                {
                    var cell = row[x];
                    if (cell)
                    {
                        context.fillRect(x * TILE - 1, y * TILE - 1, TILE - 2, TILE - 2);
                    }
                }
            }
        }
    }
}

function runSplash(deltaTime)
{
    context.fillStyle = "#5E8591";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    context.font = "55px VT323";
    context.fillStyle = "#f5f5f5"
    context.textAlign = "center";
    context.fillText("PLATFORMER GAME", canvas.width/2, 130);
    context.font = "25px VT323";
    context.fillText("PRESS ENTER", canvas.width/2, 290);


    // Check for spacebar
    if(keyboard.isKeyDown(keyboard.KEY_ENTER) == true)
    {
         gs.setState(gs.STATE_GAME);
    }

}

function runGame(deltaTime)
{
	// Quick Check for game Over if falls of screen.
	if (player.position.y > SCREEN_HEIGHT + 35)
	{
            player.health -= 1; // loose one heart.
            player.position.set(9 * TILE, 0 * TILE);
			//gs.setState(gs.STATE_GAMEOVER);
	}

	// Updates
    player.update(deltaTime);

    // Update enemies
    handleEnemy(0, deltaTime);

    // Check for enemies hitting player
    handleEnemy(3, deltaTime);

    // Bullets hitting enemies
    handleBullets(deltaTime);

	// Draw
    drawMap(); // Draw Map
    player.draw(); // Draw Player
	handleEnemy(1, deltaTime); // Draw Enemies

    // Draw Bullets
    drawBullets();

    context.rect(SCREEN_WIDTH /4, -5, SCREEN_WIDTH /2, 55);

    var my_gradient = context.createLinearGradient(0,0,0,25);
    my_gradient.addColorStop(0, "rgba(0, 0, 200, 0.5)");
    my_gradient.addColorStop(1, "rgba(0, 5, 80, 0.5)");
    context.fillStyle = my_gradient;

    context.fill();

	// Draw Score.
	context.fillStyle = "white";
    context.font = "28px VT323";
	context.textAlign = "center";
	var scoreText = "SCORE: " + score;
	context.fillText(scoreText, SCREEN_WIDTH /2, 35);

	// Draw Life counter & Show heart (health)
    hearts();

}

function hearts()
{
    var heartSpace = 1;
    var fullHearts = Math.floor(player.health/2);
    // Show all full hearts.
    for (var i = 0; i < fullHearts; i++)
    {
        context.drawImage(fullHeart, 15 + ((fullHeart.width+2) * heartSpace), SCREEN_HEIGHT - 40);
        heartSpace++;
    }
    // Half a life.
    if (player.health % 2 != 0){
        context.drawImage(halfHeart, 15 + ((halfHeart.width+2) * heartSpace), SCREEN_HEIGHT - 40);
    }
}


function handleBullets(deltaTime)
{
    var hit = false;
    for(var i = 0; i < bullets.length; i++)
    {
        bullets[i].update(deltaTime);
        if(bullets[i].position.x - worldOffsetX < 0 ||
            bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
        {
            hit = true;
        }

        for(var j = 0; j < enemies.length; j++)
        {
            if(intersects(bullets[i].position.x,  bullets[i].position.y,
                32, 32, enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
                {
                    // kill both the bullet and the enemy
                    enemies.splice(j, 1);
                    hit = true;
                    // increment the player score
                    score += 100;
                    break;
                }
        }
        if(hit == true)
        {
            bullets.splice(i, 1);
            break;
        }
    }
}

function drawBullets()
{
    for(var i = 0; i < bullets.length; i++)
    {
        bullets[i].draw();
    }
}

function createABullet()
{
    if (player.direction == 1)
    {
        var b = new Bullet(player.position.x + 47 + TILE, player.position.y - (TILE/2)
            + random(-TILE/4, TILE/4), (player.direction == 1));
    }
    else
    {
        var b = new Bullet(player.position.x - 47, player.position.y - (TILE/2)
            + random(-TILE/4, TILE/4), (player.direction == 1));
    }
    bullets.push(b);
}

// Return a random number between to variables.
function random(floor, ceil)
{
	return Math.floor((Math.random()*(ceil-floor))+floor);
}

function handleEnemy(action, deltaTime)
{
    for(var i = 0; i < enemies.length; i++)
    {
        switch(action)
    	{
    		case 0:
    			enemies[i].update(deltaTime);
    			break;
    		case 1:
    			enemies[i].draw();
    			break;
            case 3:
                if(intersects(player.position.x, player.position.y,
                    player.width, player.height, enemies[i].position.x,
                    enemies[i].position.y, enemies[i].width, enemies[i].height))
                {
                    if (player.hitTimer <= 0){
                        player.health = player.health - 1;
                        player.hitTimer = 0.4;
                    }
                }
                break;
    	}
    }
}

function runGameOver(deltaTime)
{
    context.fillStyle = "#916A5E";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    context.font = "55px VT323";
    context.fillStyle = "#f5f5f5"
    context.textAlign = "center";
    context.fillText("GAME OVER", canvas.width/2, 130);

    // Handle Timer.
    gameOverTimer += deltaTime;
    if(gameOverTimer > 3)
    {
        gameOverTimer = 0;
        // Put the player back to start for now.
        player.position.x = SCREEN_WIDTH/2;
        player.position.y = 0;
        gs.setState(gs.STATE_SPLASH);
    }

}

function runFPS(deltaTime)
{
    // Update the frame counter.
    fpsTime += deltaTime;
    fpsCount++;
    if(fpsTime >= 1)
    {
        fpsTime -= 1;
        fps = fpsCount;
        fpsCount = 0;
    }

    // Draw the FPS.
    if (showfps == true)
    {
        context.fillStyle = "#f00";
        context.font = "14px Arial";
        context.fillText("FPS: " + fps, 25, 20, 100);
    }

}


function run()
{
	context.fillStyle = "#ccc";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var deltaTime = getDeltaTime();

    if (gs.state == gs.STATE_SPLASH)
    {
        runSplash(deltaTime);
    }
    else if (gs.state == gs.STATE_GAME)
    {
        runGame(deltaTime); // Game.
        drawCollisions(false); // Draw Collisions.
    }
    else
    {
        // Game Over State
        runGameOver(deltaTime);
    }

    if(keyboard.isKeyDown(keyboard.KEY_F) == true){
        showfps = true;
    } else if (keyboard.isKeyDown(keyboard.KEY_G) == true){
        showfps = false;
    }
    runFPS(deltaTime); // Draw FPS.

    context.drawImage(crt, 0, 0);
}

initialize();

//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }

  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
