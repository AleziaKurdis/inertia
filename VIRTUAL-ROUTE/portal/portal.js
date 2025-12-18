//
//  portal.js
//
//  Created by Alezia Kurdis, December 17th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Advanced Portal for the Virtual Route.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("portal.js")[0];
    
    let renderWithZones;
    let portalData;
    let destination = "";
    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["userData", "renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        let userData = properties.userData;
        if (userData.length === 0) {
            let template = {
                "placeName": "",
                "isAlpha": true
            };
            
            Entities.editEntity(entityID, {"userData": JSON.stringify(template)});
            portalData = template;
        } else {
            portalData = JSON.parse(userData);
        }
        
        
        let virtualRoute = Script.require(ROOT + "../virtualRoute.json");
        print("JSON: " + JSON.stringify(virtualRoute));//############################## DEBUG TRASH
        
        let previousUrl;
        if (portalData.isAlpha) {
            previousUrl = virtualRoute[virtualRoute.length - 1].omegaArrivalUrl;
            for (let i = 0; i < virtualRoute.length; i++) {
                if (virtualRoute[i].placeName === portalData.placeName) {
                    destination = previousUrl;
                    break;
                } else {
                    previousUrl = virtualRoute[i].omegaArrivalUrl;
                }
            }
        } else {
            previousUrl = virtualRoute[0].alphaArrivalUrl;
            for (let i = virtualRoute.length -1; i >= 0; i--) {
                if (virtualRoute[i].placeName === portalData.placeName) {
                    destination = previousUrl;
                    break;
                } else {
                    previousUrl = virtualRoute[i].alphaArrivalUrl;
                }
            }
        }
        
        print("DESTINATION: " + destination);//############################## DEBUG TRASH
        if (destination !== "") {
            //gene portal elements
        }
    };

    this.unload = function(entityID) {

    };

})
