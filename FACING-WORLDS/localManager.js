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

    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description", "position", "rotation"]);
        
    }

    this.enterEntity = function(entityID) {

    }; 
    
    this.leaveEntity = function(entityID) {
        //do nothing.
    };
    
})
