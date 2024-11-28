//  overteHtmlControl.js
//
//  Created by Alezia Kurdis, November 18th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Plug VR Control on game.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
var channel = "overte.ak.arcadeGame.pacman";
var gameStatus = "IDLE"; //IDLE | PLAYING | OVER


EventBridge.scriptEventReceived.connect(function (message) {
    var messageObj = JSON.parse(message);
    if (messageObj.channel === channel) {
        test();
        alert("WOW! AYOYE!");
/*        if (messageObj.action === "UP") {
            if (gameStatus === "PLAYING") {
                player.control = {orientation:3};
            }
        } else if (messageObj.action === "DOWN") {
            if (gameStatus === "PLAYING") {
                player.control = {orientation:1};
            }
        } else if (messageObj.action === "LEFT") {
            if (gameStatus === "PLAYING") {
                player.control = {orientation:2};
            }
        } else if (messageObj.action === "RIGHT") {
            if (gameStatus === "PLAYING") {
                player.control = {orientation:0};
            }
        } else if (messageObj.action === "START-PAUSE") {
            switch(gameStatus) {
                case "IDLE":
                    game.nextStage();
                    break;
                case "PLAYING":
                    stageC.status = stageC.status==2?1:2;
                    break;
                case "OVER":
                    _SCORE = 0;
                    _LIFE = 5;
                    game.setStage(1);
            } 
        }
        */
    }
    

});

function test() {
    var messageToSend = {
        "channel": channel,
        "action": "TEST"
    };
    EventBridge.emitWebEvent(JSON.stringify(messageToSend));
    document.write("<font color='#ffffff'>I've replied!</font>");
}



