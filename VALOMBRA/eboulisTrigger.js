//
//  eboulisTrigger.js
//
//  Created by Alezia Kurdis, December 28th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Déclencheur d'eboulis for the VALOMBRA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    let properties;
    let alreadyTriggered = false;
    
    var channelComm = "ak.valombra.ac.communication";
    
    this.preload = function(entityID) {
        properties = Entities.getEntityProperties(entityID, ["renderWithZones", "position", "dimensions", "rotation"]);
        alreadyTriggered = false;
        Window.displayAnnouncement("EBOULIS TRIGGER ACTIVE!");
    };

    this.enterEntity = function(entityID) {
        if (!alreadyTriggered) {
            
            let request = {
                "action": "TRIGGER_EBOULIS",
                "renderWithZones": properties.renderWithZones,
                "position": getPositionFromTriggerArea(properties),
            };
            
            Script.setTimeout(function () {
                Window.displayAnnouncement("TRIGGERED: " + JSON.stringify(request));
                Messages.sendMessage(channelComm, JSON.stringify(request));
            }, Math.floor(Math.random() * 8000));
            
            alreadyTriggered = true;
        }
    };

    function getPositionFromTriggerArea(prop) {
        let targetPosition;
        let cible = {};
        cible.x = (Math.random() * prop.dimensions.x) - (prop.dimensions.x/2);
        cible.y = (Math.random() * prop.dimensions.y) - (prop.dimensions.y/2);
        cible.z = (Math.random() * 60) + 40;
        
        targetPosition = Vec3.sum(prop.position, Vec3.multiplyQbyV( prop.rotation, cible ));
        
        return targetPosition;
    }

    this.leaveEntity = function(entityID) {
        alreadyTriggered = false;
    };

    this.unload = function(entityID) {
        
    };

})
