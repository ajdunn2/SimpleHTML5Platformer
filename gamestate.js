var GameState = function(){
    this.STATE_SPLASH = 0;
    this.STATE_GAME = 1;
    this.STATE_GAMEOVER = 2;
    this.STATE_MAIN_MENU = 3;
    this.STATE_HIGH_SCORES = 4;

    this.state = 0;
};

GameState.prototype.setState = function(state)
{
    this.state = state;
};
