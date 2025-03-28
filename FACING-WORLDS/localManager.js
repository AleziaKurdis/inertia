//
//  localManager.js
//
//  Created by Alezia Kurdis, August 14th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Local side game manager.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("localManager.js")[0];
    
    var channelComm = "ak.ctf.ac.communication";
    
    var processTimer = 0;
    var TIMER_INTERVAL = 1000;
    
    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;
    var thisPosition;
    
    var players = [];
    
    var RED_FLAG_CAPTURED = SoundCache.getSound(ROOT + "sounds/RED_FLAG_CAPTURED.mp3");
    var BLUE_FLAG_CAPTURED = SoundCache.getSound(ROOT + "sounds/BLUE_FLAG_CAPTURED.mp3");
    var RED_FLAG_RETURNED = SoundCache.getSound(ROOT + "sounds/RED_FLAG_RETURNED.mp3");
    var BLUE_FLAG_RETURNED = SoundCache.getSound(ROOT + "sounds/BLUE_FLAG_RETURNED.mp3");
    var RED_FLAG_TAKEN = SoundCache.getSound(ROOT + "sounds/RED_FLAG_TAKEN.mp3");
    var BLUE_FLAG_TAKEN = SoundCache.getSound(ROOT + "sounds/BLUE_FLAG_TAKEN.mp3");
    var GAME_BEGIN = SoundCache.getSound(ROOT + "sounds/GAME_BEGIN.mp3");
    var RED_TEAM_IS_THE_WINNER = SoundCache.getSound(ROOT + "sounds/RED_TEAM_IS_THE_WINNER.mp3");
    var BLUE_TEAM_IS_THE_WINNER = SoundCache.getSound(ROOT + "sounds/BLUE_TEAM_IS_THE_WINNER.mp3");
    var FIVE_MINUTES_REMAIN = SoundCache.getSound(ROOT + "sounds/FIVE_MINUTES_REMAIN.mp3");
    var ONE_MINUTES_REMAIN = SoundCache.getSound(ROOT + "sounds/ONE_MINUTES_REMAIN.mp3");
    var EVEN_GAME = SoundCache.getSound(ROOT + "sounds/EVEN_GAME.mp3");
    var JOIN = SoundCache.getSound(ROOT + "sounds/JOIN.mp3");
    
    
    this.preload = function(entityID) {
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;
        thisPosition = properties.position;
        
        //Request the current player list
        var message = {
            "action": "GET_PLAYER_LIST"
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
        
        //Script.update.connect(myTimer);
        
    };
/*
    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            //DO SOMETHING HERE
            
            today = new Date();
            processTimer = today.getTime();
        }
    }
*/
    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if ((data.action === "REVIVE" || data.action === "JOIN") && data.avatarID === MyAvatar.sessionUUID) {
                var team = isPlayerKnown(data.avatarID);
                if (team === "NONE") {
                    team = determineTeamForNewPlayer();
                    messageToSent = {
                        "action": "SET_PLAYER_TEAM",
                        "avatarID": data.avatarID,
                        "team": team
                    };
                    Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
                    assignLandingPoint(team);
                    playAnouncement(JOIN);
                } else {
                    var flagPosition, distFlag;
                    var closer = 100;
                    var flagFoundID = "";
                    var flagFoundPosition = {"x": 0.0, "y": 0.0, "z": 0.0};
                    var flagIDs = Entities.findEntitiesByName("x!!==$%CTF-FLAG%$==!!x", MyAvatar.position, 1.2, true );
                    if (flagIDs.length > 0) {
                        for (i = 0 ; i < flagIDs.length; i++) {
                            flagPosition = Entities.getEntityProperties( flagIDs[i], ["position"] ).position;
                            distFlag = Vec3.distance(flagPosition, MyAvatar.position);
                            if (distFlag < closer) {
                                closer = distFlag;
                                flagFoundID = flagIDs[i];
                                flagFoundPosition = flagPosition;
                            }
                        }
                    }
                    assignLandingPoint(team);
                    if (data.action === "REVIVE") {
                        showDeath();
                        messageToSent = {
                            "action": "DECLARE_A_DEATH",
                            "avatarID": data.avatarID,
                            "flagFoundID": flagFoundID,
                            "flagFoundPosition": flagFoundPosition,
                            "by": data.by
                        };
                        Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
                    }
                }
            } else if (data.action === "PLAYER_LIST") {
                players = data.players;
            } else if (data.action === "RED_FLAG_CAPTURED") {
                playAnouncement(RED_FLAG_CAPTURED);
            } else if (data.action === "BLUE_FLAG_CAPTURED") {
                playAnouncement(BLUE_FLAG_CAPTURED);
            } else if (data.action === "RED_FLAG_RETURNED") {
                playAnouncement(RED_FLAG_RETURNED);
            } else if (data.action === "BLUE_FLAG_RETURNED") {
                playAnouncement(BLUE_FLAG_RETURNED);
            } else if (data.action === "RED_FLAG_TAKEN") {
                playAnouncement(RED_FLAG_TAKEN);
            } else if (data.action === "BLUE_FLAG_TAKEN") {
                playAnouncement(BLUE_FLAG_TAKEN);
            } else if (data.action === "GAME_BEGIN") {
                playAnouncement(GAME_BEGIN);
            } else if (data.action === "RED_TEAM_IS_THE_WINNER") {
                playAnouncement(RED_TEAM_IS_THE_WINNER);
            } else if (data.action === "BLUE_TEAM_IS_THE_WINNER") {
                playAnouncement(BLUE_TEAM_IS_THE_WINNER);
            } else if (data.action === "FIVE_MINUTES_REMAIN") {
                playAnouncement(FIVE_MINUTES_REMAIN);
            } else if (data.action === "ONE_MINUTES_REMAIN") {
                playAnouncement(ONE_MINUTES_REMAIN);
            } else if (data.action === "EVEN_GAME") {
                playAnouncement(EVEN_GAME);
            }

        }
    }

    function playAnouncement(soundCode) {
        var injectorOptions = {
            "position": MyAvatar.position,
            "volume": 0.4,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(soundCode, injectorOptions);
        
    }

    function showDeath() {
        var deathID = Entities.addEntity({
            "type": "ParticleEffect",
            "name": "DEATH",
            "dimensions": {
                "x": 2.9000000953674316,
                "y": 2.9000000953674316,
                "z": 2.9000000953674316
            },
            "parentID": MyAvatar.sessionUUID,
            "localPosition": {
                "x": 0,
                "y": 1,
                "z": 0
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": 255,
                "green": 0,
                "blue": 0
            },
            "alpha": 0,
            "textures": ROOT + "images/skull.png",
            "maxParticles": 240,
            "lifespan": 2,
            "emitRate": 80,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 2,
                "y": 2,
                "z": 2
            },
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "particleRadius": 0.3499999940395355,
            "radiusSpread": 0.10000000149011612,
            "radiusStart": 0,
            "radiusFinish": null,
            "colorStart": {
                "red": 255,
                "green": 166,
                "blue": 166
            },
            "colorFinish": {
                "red": null,
                "green": null,
                "blue": null
            },
            "alphaStart": 1,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinStart": null,
            "spinFinish": null,
            "rotateWithEntity": true
        },"local");
        Script.setTimeout(function () {
            Entities.deleteEntity(deathID);
        }, 4000);
    }

    function isPlayerKnown(avatarID) {
        if (players.length > 0) {
            var team = "NONE";
            for (var i = 0; i < players.length; i++) {
                if (players[i].avatarID === avatarID) {
                    team = players[i].team;
                    break;
                }
            }
            return team;
        } else {
            return "NONE";
        }
    }

    function determineTeamForNewPlayer() {
        if (players.length > 0) {
            var bleu = 0;
            var red = 0;
            for (var i = 0; i < players.length; i++) {
                if (players[i].team === "RED") {
                    red = red + 1;
                } else {
                    bleu = bleu + 1;
                }
            }
            if (bleu > red) {
                return "RED";
            } else if (blue === red) {
                return getRandomTeam();
            } else {
                return "BLUE";
            }
        } else {
            return getRandomTeam();
        }
    }

    function getRandomTeam() {
        var team = "RED";
        if (Math.random() < 0.5) {
            team = "BLUE";
        }
        return team;
    }

    function assignLandingPoint(team) {
        var tp;
        var redTP = [
            {"position": {"x": -125.7031, "y":-7.6570, "z": 4.08}, "azimuth": 90},
            {"position": {"x": -125.7031, "y": -7.6570, "z": -6.95}, "azimuth": 90},
            {"position": {"x": -113.15, "y": -7.6570, "z": -8.4343}, "azimuth": 180},
            {"position": {"x": -113.5, "y": -7.6570, "z": 5.1387}, "azimuth": 0}, 
            {"position": {"x": -104.9727, "y": 26.9263, "z": -3.16}, "azimuth": 270}, 
            {"position": {"x": -120.6709, "y": -8.7646, "z": -17.8545}, "azimuth": 0}
        ];
        
        var blueTP = [
            {"position": {"x": 125.7031, "y": -7.6570, "z": -3.89}, "azimuth": 270},
            {"position": {"x": 125.7031, "y": -7.6570, "z": 7.23}, "azimuth": 270},
            {"position": {"x": 113.71, "y": -7.6570, "z": 8.3291}, "azimuth": 0}, 
            {"position": {"x": 113.74, "y": -7.6570, "z": -5.2244}, "azimuth": 180}, 
            {"position": {"x": 104.9727, "y": 26.9263, "z": 3.06}, "azimuth": 90},
            {"position": {"x": 120.6709, "y": -8.7646, "z": 17.8545}, "azimuth": 180}
        ];
        
        if (team === "RED") {
            tp = redTP[Math.floor(Math.random() * redTP.length)];
        } else {
            tp = blueTP[Math.floor(Math.random() * blueTP.length)];
        }
        MyAvatar.velocity = {"x": 0.0, "y": 0.0, "z": 0.0};
        MyAvatar.angularVelocity = {"x": 0.0, "y": 0.0, "z": 0.0};
        MyAvatar.position = Vec3.sum(thisPosition, tp.position);
        MyAvatar.orientation = Quat.fromVec3Degrees({ "x": 0, "y": tp.azimuth, "z": 0 });
        
    }

    this.unload = function(entityID) {
        /*
        if (startTriggerId !== Uuid.NULL) {
            Entities.deleteEntity(startTriggerId);
            startTriggerId = Uuid.NULL;
        }
        */

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        //Script.update.disconnect(myTimer);
        Workload.getConfig("controlViews")["regulateViewRanges"] = true;
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });
    
})
