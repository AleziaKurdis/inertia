"use strict";
//
//  teleporter.js
//
//  Created by Alezia Kurdis, April 19th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Generic 3d portals for inter hub.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("teleporter.js")[0];
    var portalData;
    
    this.preload = function(entityID) {

        var properties = Entities.getEntityProperties(entityID, ["userData"]);
        portalData = properties.userData;
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
