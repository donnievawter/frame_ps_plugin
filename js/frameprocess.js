async function alertFunction(message) {
    // console.log(`alertFunction: ${message}`);
    await core.showAlert({ message });
}

async function processResults(userInput) {
    try {
        await photoshop.core.executeAsModal(async () => {
            // console.log("starting processResults");
            await processUserInput(userInput);

            // await alertFunction("Files opened and checked");

            await logDocuments();
            await makeActive(image);
            // await flattenImage(image);
            await renameBackGround();
            await setCanvas(image);
            await moveImageUp(bottomPadding);

            await createMatLayer(image);

            await setMatColor(matFloat);

            await fillMatandMoveToBottom();

            await maskAndStyleMat();

            await copyFrameToImage();

            await addTitle(title, titleOffset, bottomPadding);
            await destroyVars();

        });

    } catch (error) {
        console.log(error);
    }
}
async function maskAndStyleMat() {
    // Select the "pic" layer
    var imageLayer = image.layers.getByName("pic");
    setActiveLayer(image, "pic");

    // Get dimensions of the "pic" layer
    var imageBounds = imageLayer.bounds;
    var imageWidth = imageBounds.right - imageBounds.left;
    var imageHeight = imageBounds.bottom - imageBounds.top;
    var imageX = imageBounds.left;
    var imageY = imageBounds.top;
    // console.log("width,height,x,y" + imageWidth + " " + imageHeight + " " + imageX + " " + imageY);
    // Select the "mat color" layer
    setActiveLayer(image, "mat color");
    let mLayer = image.layers.getByName("mat color");
    // Create a selection based on the "pic" layer's dimensions
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "set",
                "_target": [
                    {
                        "_property": "selection",
                        "_ref": "channel"
                    }
                ],
                "to": {
                    "_obj": "rectangle",
                    "top": {
                        "_unit": "pixelsUnit",
                        "_value": imageY
                    },
                    "left": {
                        "_unit": "pixelsUnit",
                        "_value": imageX
                    },
                    "bottom": {
                        "_unit": "pixelsUnit",
                        "_value": imageY + imageHeight
                    },
                    "right": {
                        "_unit": "pixelsUnit",
                        "_value": imageX + imageWidth
                    }
                }
            }
        ], {});

    // Add layer mask to create the cutout (inverted)
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "make",
                "at": {
                    "_enum": "channel",
                    "_ref": "channel",
                    "_value": "mask"
                },
                "new": {
                    "_class": "channel"
                },
                "using": {
                    "_enum": "userMaskEnabled",
                    "_value": "hideSelection"
                }
            }
        ], {});

    // Clear the selection after creating the mask
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "channel",
                        "_enum": "channel",
                        "_value": "selection"
                    }
                ],
                "to": {
                    "_enum": "ordinal",
                    "_value": "none"
                }
            }
        ], {});

    // Apply Drop Shadow effect
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "layer",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ],
                "to": {
                    "layerEffects": {
                        "dropShadow": {
                            "enabled": true,
                            "mode": {
                                "_enum": "blendMode",
                                "_value": "multiply"
                            },
                            "color": {
                                "_obj": "RGBColor",
                                "red": 0,
                                "grain": 0,
                                "blue": 0
                            },
                            "opacity": {
                                "_unit": "percentUnit",
                                "_value": 75
                            },
                            "useGlobalAngle": false,
                            "localLightingAngle": {
                                "_unit": "angleUnit",
                                "_value": 135
                            },
                            "distance": {
                                "_unit": "pixelsUnit",
                                "_value": 15
                            },
                            "chokeMatte": {
                                "_unit": "percentUnit",
                                "_value": 5
                            },
                            "blur": {
                                "_unit": "pixelsUnit",
                                "_value": 20
                            }
                        }
                    }
                }
            }
        ], {});
    //try shrinking
    const fix = 3;
    await mLayer.scale(100 - fix, 100 - fix, constants.AnchorPosition.MIDDLECENTER);

}

async function addTitle(text, offset, padding) {
    try {
        // console.log("adding " + text + " to image");
        await makeActive(image);
        let theLayer;
        const fudge = image.height / 15;
        const pos = {
            x: image.width / 2,
            y: image.height - padding - offset - fudge,
            width: image.width / 5,
            height: image.height / 50
        }
        const pixHeight =pos.height*50/1200* parseInt(fontSize,10);;
console.log(pixHeight);
        theLayer = await image.createTextLayer({
            name: "title",
            contents: text,
            fontName: fontChoice[0],
            fontSize: pixHeight,
            position: pos,
            justification: constants.Justification.CENTER
        });
        let sourceLayer;
        for (var i = 0; i < image.layers.length; i++) {
            if ((image.layers[i].name === text) || (image.layers[i].name === 'title')) {
                sourceLayer = image.layers[i];
                // console.log(i);
                break;
            }
        }
        // console.log(sourceLayer);
        // console.log(sourceLayer.name + " is being moved to the top of the layer stack");
        sourceLayer.name = "title";
        await sourceLayer.move(image.layers[0], constants.ElementPlacement.PLACEBEFORE);
        //center it
        await photoshop.action.batchPlay(
            [
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_name": "frame",
                            "_ref": "layer"
                        }
                    ],
                    "layerID": [
                        6
                    ],
                    "makeVisible": false
                },
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_name": "title",
                            "_ref": "layer"
                        }
                    ],
                    "makeVisible": false,
                    "selectionModifier": {
                        "_enum": "selectionModifierType",
                        "_value": "addToSelection"
                    }
                },
                {
                    "_obj": "align",
                    "_target": [
                        {
                            "_enum": "ordinal",
                            "_ref": "layer"
                        }
                    ],
                    "alignToCanvas": false,
                    "using": {
                        "_enum": "alignDistributeSelector",
                        "_value": "ADSCentersH"
                    }
                }
            ], {});

        try {
            let picBounds = image.layers.getByName("pic").bounds;
            let titleBounds = image.layers.getByName("title").bounds;
            // console.log("title offset ");
            // console.log(titleBounds.bottom - picBounds.bottom);
        } catch (er) {
            console.log(er);
        }

    } catch (error) {
         console.log(error);
    }
}
async function moveImageUp(padding) {
    await makeActive(image);

    let layer;

    for (var i = 0; i < image.layers.length; i++) {
        // console.log(i + " " + image.layers[i].name);
        if (image.layers[i].name == "pic") {
            layer = await image.layers[i];
            break;
        }
    }
    await layer.translate(0, -padding);
}
async function fixPosition(lay, ws, hs) {

    const hOffset = frame.layers[0].bounds.left * hs / 100;
    const vOffset = frame.layers[0].bounds.top * ws / 100;
    await lay.translate(hOffset - lay.bounds.left, vOffset - lay.bounds.top);
    // console.log("bounds after fix", lay.bounds);
}
async function setActiveLayer(doc, layerName) {
    // console.log("setting active layer to " + layerName + " in " + doc.name);
    app.activeDocument = doc;
    // Set the active layer using batchPlay
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "select",
                "_target": [
                    {
                        "_ref": "layer",
                        "_name": layerName
                    }
                ]
            }
        ], {}
    )

}
async function useLayerEffects(doc, layerName, status) {
    await setActiveLayer(doc, layerName);
    const showHide = status ? "show" : "hide";
    // console.log("setting layerEffect to " + showHide + " for " + layerName + " in " + doc.name);

    await photoshop.action.batchPlay(
        [
            {
                "_obj": showHide,
                "null": [
                    {
                        "_ref": [
                            {
                                "_ref": "layerEffects"
                            },
                            {
                                "_enum": "ordinal",
                                "_ref": "layer"
                            }
                        ]
                    }
                ]
            }
        ], {});

}
async function copyFrameToImage() {
    // console.log("copy frame to image");
    const theTop = await image.layers.length;
    const theHeightScale = 100 * image.height / frame.height;
    const theWidthScale = 100 * image.width / frame.width;
    // console.log(theHeightScale);
    // console.log(theWidthScale);
    let anchorPos = constants.AnchorPosition
    await frame.layers[0].duplicate(image, constants.ElementPlacement.PLACEATEND, "frame");
    //turn layer effects back on
    await useLayerEffects(frame, frame.activeLayers[0].name, true);
    // console.log(app.activeDocument.name);
    await useLayerEffects(image, "frame", true);
    // console.log(app.activeDocument.name);
    // console.log(app.activeDocument.activeLayers[0].name + " is currently activce");
    for (var i = 0; i < image.layers.length; i++) {
        // console.log(image.layers[i].name);
    }

    const layer = await image.layers.getByName("frame")
    // console.log("after copy " + layer.name + " " + layer.bounds.width);
    // console.log(layer.bounds);
    // console.log(layer.name + " is being scaled to " + theWidthScale + "% width and " + theHeightScale + "% height");
    await photoshop.action.batchPlay(
        [
            {
                "_obj": "transform",
                "_target": [
                    {
                        "_enum": "ordinal",
                        "_ref": "layer"
                    }
                ],
                "freeTransformCenterState": {
                    "_enum": "quadCenterState",
                    "_value": "QCSAverage"
                },
                "height": {
                    "_unit": "percentUnit",
                    "_value": theHeightScale
                },
                "interfaceIconFrameDimmed": {
                    "_enum": "interpolationType",
                    "_value": "bilinear"
                },
                "width": {
                    "_unit": "percentUnit",
                    "_value": theWidthScale
                }
            }
        ], {});

    //  await layer.scale(theWidthScale, theHeightScale, anchorPos.MIDDLECENTER);
    // console.log("after first scale " + layer.name + " " + layer.bounds.width);
    // console.log(layer.bounds);
    //we need to account for fact that with layer effects our positioning is wrong
    //await layer.translate(-layer.bounds.left, -layer.bounds.top);
    await fixPosition(layer, theWidthScale, theHeightScale);
    // console.log(layer.name);
    // console.log(layer.bounds);

    // console.log("width: " + image.width + " height: " + image.height);
    // console.log("starting faff");
    let sourceLayer, destLayer;
    for (var i = 0; i < image.layers.length; i++) {
        if (image.layers[i].name === 'pic') {
            sourceLayer = image.layers[i];
        }
        if (image.layers[i].name === 'frame') {
            destLayer = image.layers[i];
        }
    }
    // console.log(sourceLayer);
    // console.log(destLayer);

    await sourceLayer.move(destLayer, constants.ElementPlacement.PLACEAFTER);
    await useLayerEffects(image, "frame", false);
    await image.trim(constants.TrimType.TRANSPARENT);
    await useLayerEffects(image, "frame", true);

    // console.log("finished frame");

}
async function fillMatandMoveToBottom() {
    await photoshop.action.batchPlay(
        [{
            "_obj": "fill",
            "mode": {
                "_enum": "blendMode",
                "_value": "normal"
            },
            "opacity": {
                "_unit": "percentUnit",
                "_value": 100.0
            },
            "using": {
                "_enum": "fillContents",
                "_value": "foregroundColor"
            }
        },
        {
            "_obj": "move",
            "_target": [
                {
                    "_enum": "ordinal",
                    "_ref": "layer"
                }
            ],
            "adjustment": false,
            "to": {
                "_index": 0,
                "_ref": "layer"
            },
            "version": 5
        }], {});
}

async function createMatLayer(im) {
    await im.createLayer(constants.LayerKind.NORMAL, { name: "mat color", opacity: 100, blendMode: constants.BlendMode.NORMAL });
}
async function setCanvas(doc) {
    let width = await doc.width;
    let height = await doc.height;
    await doc.resizeCanvas(width * expansionRatio, height * expansionRatio);
}

async function renameBackGround(newName) {
    await photoshop.action.batchPlay(
        [{
            "_obj": "set",
            "_target": [
                {
                    "_property": "background",
                    "_ref": "layer"
                }
            ],
            "to": {
                "_obj": "layer",
                "mode": {
                    "_enum": "blendMode",
                    "_value": "normal"
                },
                "name": (newName || "pic"),
                "opacity": {
                    "_unit": "percentUnit",
                    "_value": 100.0
                }
            }
        }], {})

}

async function setMatColor(rgbFloat) {
    // console.log("setting mat color");
    // console.log(rgbFloat);
    const greenValue = rgbFloat.grain !== undefined ? rgbFloat.grain : rgbFloat.green;
    const SolidColor = require("photoshop").app.SolidColor;
    const col = new SolidColor();
    col.rgb.red = rgbFloat.red;
    col.rgb.green = greenValue;
    col.rgb.blue = rgbFloat.blue;
    app.foregroundColor = col;
}
async function makeActive(doc) {
    app.activeDocument = doc;
}
async function processUserInput(userInput) {
    // console.log(userInput);
    title = userInput.title;
    titleOffset = userInput.titleOffset;
    bottomPadding = userInput.bottomPadding;
    matColor = userInput.matColor;
    matFloat = userInput.matFloat;
    expansionRatio = userInput.expansionRatio;
    fontChoice=userInput.fontChoice;
    console.log(fontChoice);
       // console.log("inputs generated");
    // console.log(matFloat);
     
}

async function selectFrame() {
    await photoshop.action.batchPlay(
        [
            { "_obj": "select", "_target": [{ "_offset": -1, "_ref": "document" }] }
        ], {}
    );
}
async function destroyVars() {
    frame = null;
    image = null;
    title = null;
    titleOffset = null;
    bottomPadding = null;
    matColor = null;
    expansionRatio = null;
    matFloat = null;
    fontChoice=null;
    fontSize=null
  document.getElementById('step1finished').style.display = 'none';
  document.getElementById('step2finished').style.display = 'none';
  document.getElementById('completedButton').style.display='none';

}
async function logDocuments() {

    // console.log(frame);
    // console.log(image);
    // console.log(frame.path);
    // console.log(frame.name);
    // console.log(image.path);
    // console.log(image.name);
    // console.log("files should be open");
}
async function flattenImage(im) {
    app.activeDocument = image;
    //await photoshop.action.batchPlay(
    //    [
    //        { "_obj": "flattenImage" }
    //    ], {}
    //);
    await app.activeDocument.flatten();

    // console.log(app.activeDocument.name + " " + app.activeDocument.layers.length);
}
