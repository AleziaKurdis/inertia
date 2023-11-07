//
//  gotgPortal.js
//
//  Created by Alezia Kurdis, November 6th 2023.
//  Copyright 2023 Overte e.V.
//
//  gotg like space portal & navigation app.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "gotgPortal.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var APP_NAME = "SPACE NAV";
    var APP_ICON_INACTIVE = ROOT + "images/icon_template_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "images/icon_template_active.png";
    var appStatus = false;
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        "text": APP_NAME,
        "icon": APP_ICON_INACTIVE,
        "activeIcon": APP_ICON_ACTIVE,
        "sortOrder": 1,
        "captionColor": "#ffae00"
    });

    function clicked(){
        if (appStatus === true) {
            //DEACTIVATE
            print("INACTIVE");
            appStatus = false;
        }else{
            //ACTIVATE 
            print("ACTIVE");
            appStatus = true;
        }

        button.editProperties({
            isActive: appStatus
        });
    }

    button.clicked.connect(clicked);

    function cleanup() {
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
}());
