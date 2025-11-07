//#####################
//
//  clocks_CMApp.js
//
//  Created by Alezia Kurdis, November 1st, 2025.
//  Copyright 2025, Overte e.V.
//
//  Clocks - Contextual Menu Application
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
"use strict";
const ContextMenu = Script.require("contextMenu");
var ROOT = Script.resolvePath('').split("clocks_CMApp.js")[0];

const LEFT_HAND = MyAvatar.getDominantHand() === "right" ? true : false;

let isActive = false;
let clockWebID = Uuid.NONE;

var hmdPanelLocalPosition = {"x": 0.3, "y": -0.25, "z": -1.0};
var hmdPanelLocalRotation = Quat.fromVec3Degrees({"x": 0, "y": -3, "z": 0});
var CAMERA_MATRIX_INDEX = -7;

function toggleItem() {
	if (isActive) {
        if (clockWebID !== Uuid.NONE) {
            Entities.deleteEntity(clockWebID);
            clockWebID = Uuid.NONE;
        }
		isActive = false;
	} else {
        if (clockWebID === Uuid.NONE) {
            clockWebID = Entities.addEntity({
                "type": "Web",
                "dpi": 23,
                "name": "4 clocks",
                "parentID": MyAvatar.sessionUUID,
                "parentJointIndex": CAMERA_MATRIX_INDEX,
                "localPosition": hmdPanelLocalPosition,
                "localRotation": hmdPanelLocalRotation,
                "dimensions": {"x": 0.3, "y": 1.0, "z": 0.01},
                "isVisibleInSecondaryCamera": false,
                "sourceUrl": ROOT + "../fourClocks.html",
                "alpha": 0.5,
                "maxFPS": 1,
                "wantsKeyboardFocus": false,
                "showKeyboardFocusHighlight": false,
                "useBackground": false,
                "renderLayer": "hud"
            }, "local");
        }
		isActive = true;
	}
}

const actionSet = [
	{
		text: "Clocks",
		textColor: [255, 255, 255],
		localClickFunc: "actionClocks",
        iconImage: ROOT + "icon.png"
	},
];

ContextMenu.registerActionSet("menuItemClocks", actionSet, ContextMenu.ROOT_SET);

Messages.messageReceived.connect((channel, msg, senderID, _localOnly) => {
	if (channel !== ContextMenu.CLICK_FUNC_CHANNEL) { return; }
	if (senderID !== MyAvatar.sessionUUID) { return; }

	const data = JSON.parse(msg);

	if (data.func === "actionClocks") {
        toggleItem();
        
		actionSet[0].textColor = isActive ? [0, 0, 0] : [255, 255, 255];
		actionSet[0].backgroundColor = isActive ? [255, 255, 255] : [0, 0, 0];
		ContextMenu.editActionSet("menuItemClocks", actionSet);
	}
});

Script.scriptEnding.connect(() => {
	ContextMenu.unregisterActionSet("menuItemClocks");
    if (clockWebID !== Uuid.NONE) {
        Entities.deleteEntity(clockWebID);
        clockWebID = Uuid.NONE;
    }
});
