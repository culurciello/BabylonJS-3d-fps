// The Game main class
import Game from './Game.js';

window.GAME = null;

window.initialGameOptions = {
    
    /**
     * Main Options
     */
    
    'debugMode': true, // Enable it to show debug messages on console

    /**
     * Colors (All in Hexadecimal)
     */

    // Object Colors
    'backgroundColor': '#a29bfe',

};

var app = {

    init() {
        GAME = new Game(window.initialGameOptions);
        GAME.start();
    }

}

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});