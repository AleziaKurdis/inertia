//
//  bullet.js
//
//  Created by Alezia Kurdis, September 8th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Collision effect and self deletion.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("bullet.js")[0];
    var channelComm = "ak.ctf.ac.communication";
    var ownerID;
    var timer;
    var lethalRadius;
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["owningAvatarID", "description"]);
        ownerID = properties.owningAvatarID;
        lethalRadius = parseInt(properties.description, 10);
        if (ownerID === MyAvatar.sessionUUID) {
            timer = Script.setTimeout(function() {
                Entities.deleteEntity(entityID);
            }, 20000);
        }
    }; 

    this.collisionWithEntity = function (myID, otherID, collision) {
        var i, messageSent;
        var position = Entities.getEntityProperties(myID, ["position"]).position;
        if (ownerID === MyAvatar.sessionUUID) {
            print("EXPLOSION AT: " + JSON.stringify(position));
            print("By: " + ownerID );
            var victimes = AvatarManager.getAvatarsInRange( position, lethalRadius );
            for (i = 0; i < victimes.length; i++) {
                messageSent = {
                    "action": "REVIVE",
                    "avatarID": victimes[i],
                    "by": ownerID
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageSent));

                messageSent = {
                    "action": "KILL",
                    "position": position
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageSent));
            }
            Script.clearTimeout(timer);
            Entities.deleteEntity(myID);
        }

    };
})
