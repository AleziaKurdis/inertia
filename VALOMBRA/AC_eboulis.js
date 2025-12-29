//
//
//  AC_eboulis.js
//
//  Created by Alezia Kurdis, December 28th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Server side eboulis generator for Valombra.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("EBOULIS: start running.");
const jsMainFileName = "AC_eboulis.js";
const ROOT = Script.resolvePath('').split(jsMainFileName)[0];

const channelComm = "ak.valombra.ac.communication";
const MAX_DIST_AROUND_TARGET = 1.0;
const MAX_SIZE = 3.0;

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "TRIGGER_EBOULIS") { 
            print("EBOULIS: RECU");
            generateEboulis(data.renderWithZones, data.position);
        }
    }
}

function randomExponential(N, power = 3) {
    return N * Math.pow(Math.random(), power);
}

function generateEboulis(renderWithZones, position) {
    let numberOfRock = 1 + Math.floor(randomExponential(15, 3));
    
    var id, rezPosition;
    for (let i = 0; i < numberOfRock; i++ ) {
        rezPosition = Vec3.sum(position, { 
            "x": (Math.random() * (MAX_DIST_AROUND_TARGET *2)) - MAX_DIST_AROUND_TARGET, 
            "y": 0.0, 
            "z": (Math.random() * (MAX_DIST_AROUND_TARGET *2)) - MAX_DIST_AROUND_TARGET 
        });
        
        id = Entities.addEntity({
            "name": "Rock " + i,
            "position": rezPosition,
            "shapeType": "sphere",
            "type": "Model",
            "renderWithZones": renderWithZones || [],
            "dimensions": {
                "x": (Math.random() * MAX_SIZE) + 0.04,
                "y": (Math.random() * MAX_SIZE) + 0.04,
                "z": (Math.random() * MAX_SIZE) + 0.04
            },
            "useOriginalPivot": false,
            "grab": {
                "grabbable": true
            },
            "lifetime": 15,
            "modelURL": ROOT + "models/rock.fst",
            "velocity": { "x": 0.0, "y": -0.01, "z": 0.0},
            "damping": 0.0,
            "gravity": { "x": 0.0, "y": -9.8, "z": 0.0},
            "dynamic": true
        }, "domain");
    }

}

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);

Script.scriptEnding.connect(function () {
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
});

