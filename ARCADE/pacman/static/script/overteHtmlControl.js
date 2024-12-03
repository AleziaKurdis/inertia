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

function playSound(sound); {
    var messageToSend = {
        "channel": channel,
        "action": "PLAYSOUND",
        "sound": sound
    };
    EventBridge.emitWebEvent(JSON.stringify(messageToSend));
}


