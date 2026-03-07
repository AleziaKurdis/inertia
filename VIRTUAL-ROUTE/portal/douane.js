//
//  douane.js
//
//  Created by Alezia Kurdis, March 6th, 2026.
//  Copyright 2025, Overte e.V.
//
//  Border stamp mechanism for the Virtual Route.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("douane.js")[0];
    const PASSPORT_SETTING = "virtualRouteAKpassport";
    let borderStampType = "";
    let placeName = "";
    const officialStamp = ["ALPHA", "TARGET", "OMEGA"];
    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["description", "tags"]);
        let tags = properties.tags;
        if (tags.length === 1) {
            borderStampType = tags[0];
        }
        placeName = properties.description;
    };

    this.enterEntity = function(entityID) {
        if (location.protocol.substr(0, 4) !== "http") {
            if (placeName !== "" && officialStamp.indexOf(borderStampType) !== -1) {

                //Load the setting PASSPORT_SETTING
                let passport = Settings.getValue(PASSPORT_SETTING, []);
                
                //update the stamp
                let found = false;
                for (let i = 0; i < passport.length; i++) {
                    if (passport[i].placeName === placeName) {
                        passport[i][borderStampType] = true;
                        
                        if (passport[i].ALPHA && passport[i].TARGET && passport[i].OMEGA) {
                            passport[i].completionStatus = true;
                            passport[i].numberOfCompletion++;
                            passport[i].ALPHA = false;
                            passport[i].TARGET = false;
                            passport[i].OMEGA = false;
                        }
                        
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    let entry = {
                        "placeName": placeName,
                        "ALPHA": false,
                        "TARGET": false,
                        "OMEGA": false,
                        "completionStatus": false,
                        "numberOfCompletion": 0,
                    };
                    entry[borderStampType] = true;
                    passport.push(entry);
                }
                
                // save the setting PASSPORT_SETTING
                Settings.setValue(PASSPORT_SETTING, passport);
                
            }
        }
    };

})
