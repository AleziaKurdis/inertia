//
//  elevator.js
//
//  Created by Alezia Kurdis, December 10th, 2025.
//  Copyright 2025, Overte e.V.
//
//  elevator for the VALOMBRA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 

    this.preload = function(entityID) {
        //do nothing
    };


    
    this.unload = function(entityID) {
        //Do nothing
    };    

    this.enterEntity = function(entityID) {
        var description = Entities.getEntityProperties(entityID, ["description"]).description;
        var vector = JSON.parse(description);
        var avPos = MyAvatar.position;
        MyAvatar.position = {"x": avPos.x + vector.x, "y": avPos.y + vector.y, "z": avPos.z + vector.z};
    }

})
