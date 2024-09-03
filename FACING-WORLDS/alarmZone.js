//
//  alarmZone.js
//
//  Created by Alezia Kurdis, September 2nd, 2024.
//  Copyright 2024, Overte e.V.
//
//  Alarm system for ennemi intrusion.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("alarmZone.js")[0];
    
    var channelComm = "ak.ctf.ac.communication";
    var players = [];
    var side, zonePosition;
    var injectorOptions;
    var injector = null;
    var ALARM_SOUND = SoundCache.getSound(ROOT + "sounds/alarm.mp3");
    var loop = 0;
    var timer = null;
    var DURATION = 12000; //12 sec.
    var zoneActive = false;
    
    this.preload = function(entityID) {
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        var properties = Entities.getEntityProperties(entityID,["description", "position"]);
        zonePosition = properties.position;
        side = properties.description;
        if (side !== "BLUE" && side !== "RED") {
            side = "ERROR";
        }
    };

    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "PLAYER_LIST") {
                players = data.players;
            } else if (data.action === "MANAGE_START_BUTTON") {
                
                if (data.visible) {
                    zoneActive = false;
                } else {
                    zoneActive = true;
                }
            }
        }
    }

    this.enterEntity = function(entityID) {
        if (side === "ERROR" || !zoneActive) {
            return;
        } else {
            var avatarTeam = isPlayerKnown(MyAvatar.sessionUUID);
            if (avatarTeam !== "NONE" && avatarTeam !== side) {
                //alarm
                injectorOptions = {
                    "position": zonePosition,
                    "volume": 1.0,
                    "loop": true,
                    "localOnly": false
                };
                injector = Audio.playSound(ALARM_SOUND, injectorOptions);
                
                timer = Script.setTimeout(function () {
                    if (injector !== null) {
                        injector.stop();
                        injector = null;
                    }
                    timer = null;
                }, DURATION);
            }
        }
    };
    
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
    

    this.leaveEntity = function(entityID) {
        if (injector !== null) {
            injector.stop();
            injector = null;
        }
        if (timer !== null) {
            Script.clearTimeout(timer);
            timer = null;
        }
    };
    
    this.unload = function(entityID) {
        if (injector !== null) {
            injector.stop();
            injector = null;
        }
        if (timer !== null) {
            Script.clearTimeout(timer);
            timer = null;
        }        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });
    
})
