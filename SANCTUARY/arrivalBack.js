"use strict";
//
//  arrivalBack.js
//
//  Created by Alezia Kurdis, September 5th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Arrival portal that can be used to return back.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("arrivalBack.js")[0];
    var fxID = Uuid.NULL;
    
    this.preload = function(entityID) {
        //Sett effect here
        /*
        fxID = Entities.addEntity({
                
            }, "local");
        
        */
    }

    this.enterEntity = function(entityID) {
        if (location.canGoBack()) {
            location.goBack();
        } else {
            if (LocationBookmarks.getHomeLocationAddress()) {
                location.handleLookupString(LocationBookmarks.getHomeLocationAddress());
            } else {
                Window.location = "file:///~/serverless/tutorial.json";
            }
        }
    }; 
    
    this.unload = function(entityID) {
        //remove effect
        if (fxID !== Uuid.NULL) {
            Entities.deleteEnity(fxID);
            fxID = Uuid.NULL;
        }
    };
    
    
})

