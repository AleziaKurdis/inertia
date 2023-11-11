//
//  teleport.js
//
//  Created by Alezia Kurdis,November 10th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Space 3d portals.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("teleport.js")[0];
    var portalData;
    
    this.preload = function(entityID) {

        var properties = Entities.getEntityProperties(entityID, ["description"]);
        portalData = properties.description;
    }

    this.enterEntity = function(entityID) {
      if (portalData.length > 0) {
        Window.location = portalData;
      }
      
    }; 
    
    this.leaveEntity = function(entityID) {
        //do nothing.
    };
    
    
})
