//
//  hyperspace.js
//
//  Created by Alezia Kurdis, July 17th, 2025.
//  Copyright 2025, Overte e.V.
//
//  mass teleportation script for the spaceship Breemor.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("hyperspace.js")[0];
    var entityPosition;
    var entityRotation;
    var thisEntityID = Uuid.NONE;
    var thisUniqueKey;
    
    var channelName = "org.overte.ak.breemor";

    var HALF = 0.5;
    
    var tpSound;
    var TP_SOUND = ROOT + "../sounds/hyperspaceWarning.wav";
    
    var destinations = Script.require(ROOT + "destinations.json");

    this.preload = function(entityID) {
        tpSound = SoundCache.getSound(TP_SOUND);
        var properties = Entities.getEntityProperties(entityID, ["description", "renderWithZones", "position", "rotation"]);
        renderWithZones = properties.renderWithZones;
        entityPosition = properties.position;
        entityRotation = properties.rotation;
        channelName = channelName + "." + properties.description;
        thisEntityID = entityID;
        Messages.subscribe(channelName);
        Messages.messageReceived.connect(onMessageReceived);
    };
    
    function playPunctualSound(sound, position) {
        var injectorOptions = {
            "position": position,
            "volume": 1.0,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(sound, injectorOptions);
    }

    this.unload = function(entityID) {
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelName);
    };

    function onMessageReceived(channel, message, sender, localOnly) {
        var explosed;
        if (channel === channelName) {
            if ( message.substr(0, 10) === "HYPERSPACE") {
                var divided = message.split("_");
                var myDestination = parseInt(divided[1], 10);
                hyperspace(myDestination);
            }
        }
    }

    function hyperspace(destination) {
        if (positionIsInsideEntityBounds(thisEntityID, MyAvatar.position)) {
            var relativePosition = Vec3.subtract( MyAvatar.position, entityPosition );
            var eulerAngles = Quat.safeEulerAngles(entityRotation);
            var realRelativePosition = Vec3.multiplyQbyV(Quat.fromVec3Degrees({"x": 0, "y": -eulerAngles.y, "z": 0.0 }), relativePosition);
            var arrivalPosition = Vec3.sum(destinations[destination].position, Vec3.multiplyQbyV(destinations[destination].rotation, realRelativePosition));
            var arrivalRotation = Quat.multiply(destinations[destination].rotation, Quat.multiply( MyAvatar.orientation, entityRotation ));
            
            var arrivalURL = "hifi://" + destinations[destination].placename + "/" + arrivalPosition.x + "," + (arrivalPosition.y - 0.2) + "," + arrivalPosition.z + "/" + arrivalRotation.x + "," + arrivalRotation.y  + "," + arrivalRotation.z  + "," + arrivalRotation.w;    
            
            playPunctualSound(tpSound, MyAvatar.position);
            Script.setTimeout(function () {
                Window.location = arrivalURL;
            }, 14000);
        }
    }


    function positionIsInsideEntityBounds(entityID, targetPosition) {
        targetPosition = targetPosition || MyAvatar.position;

        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var entityPosition = properties.position;
        var entityDimensions = properties.dimensions;
        var entityRotation = properties.rotation;

        var worldOffset = Vec3.subtract(targetPosition, entityPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);

        var minX = -entityDimensions.x * HALF;
        var maxX = entityDimensions.x * HALF;
        var minY = -entityDimensions.y * HALF;
        var maxY = entityDimensions.y * HALF;
        var minZ = -entityDimensions.z * HALF;
        var maxZ = entityDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
    }

})
