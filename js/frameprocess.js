async function alertFunction(message) {
   
    await core.showAlert({ message });
}

async function processResults(userInput) {
    try {
        await photoshop.core.executeAsModal(async () => {
        
            await processUserInput(userInput);

           

         
            await makeActive(image);
          
            await renameBackGround();
            await setCanvas(image);
            await moveImageUp();

            await createMatLayer(image);

            await setMatColor(matFloat);

            await fillMatandMoveToBottom();

            await maskAndStyleMat();

            await copyFrameToImage();

            await addTitle(title);
            await destroyVars();

        });

    } catch (error) {
        console.log(error);
    }
}
async function maskAndStyleMat() {
   
    var imageLayer = image.layers.getByName("pic");
    setActiveLayer(image, "pic");

   
    var imageBounds = imageLayer.bounds;
    var imageWidth = imageBounds.right - imageBounds.left;
    var imageHeight = imageBounds.bottom - imageBounds.top;
    var imageX = imageBounds.left;
    var imageY = imageBounds.top;
   
    setActiveLayer(image, "mat color");
    let mLayer = image.layers.getByName("mat color");
   
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

async function addTitle(text) {
    try {
      
        await makeActive(image);
        let theLayer;
        const fudge = image.height / 15;
        const bottomOfMat = image.height - finalBorderHeight;
        const topOfMat = image.layers.getByName("pic").bounds.bottom;
        const theY = (bottomOfMat + topOfMat) / 2;
        const l=image.layers.getByName("pic").bounds.left;
        const r=image.layers.getByName("pic").bounds.right;
        const theX=(l+r)/2;
       
        const pos = {
            x: theX,
            y: theY,
            width: image.width / 5,
            height: image.height / 50
        }
        const pixHeight = pos.height * 50 / 1200 * parseInt(fontSize, 10);;
     
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
               
                break;
            }
        }
       
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

       

    } catch (error) {
        console.log(error);
    }
}
async function moveImageUp() {
    await makeActive(image);

    let layer;

    for (var i = 0; i < image.layers.length; i++) {
       
        if (image.layers[i].name == "pic") {
            layer = await image.layers[i];
            break;
        }
    }
    const curBottompos = layer.bounds.bottom;
    const desiredBottompos = image.height -finalBorderHeight - parseInt((units == "pixels") ? mBottom : mBottom * layer.bounds.height / 100, 10);
    const curleft = layer.bounds.left;
    const desiredleftpos = finalBorderWidth + parseInt((units == "pixels") ? mLeft : mLeft * layer.bounds.width / 100, 10);

      await layer.translate(desiredleftpos-curleft,  desiredBottompos-curBottompos);
}
async function fixPosition(lay, ws, hs) {

    const hOffset = frame.layers[0].bounds.left * hs / 100;
    const vOffset = frame.layers[0].bounds.top * ws / 100;
    await lay.translate(hOffset - lay.bounds.left, vOffset - lay.bounds.top);
   
}
async function setActiveLayer(doc, layerName) {
   
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
   
    const theTop = await image.layers.length;
    const theHeightScale = 100 * image.height / frame.height;
    const theWidthScale = 100 * image.width / frame.width;
    
    let anchorPos = constants.AnchorPosition
    frame.selection.deselect();
    await frame.layers[0].duplicate(image, constants.ElementPlacement.PLACEATEND, "frame");
    //turn layer effects back on
    await useLayerEffects(frame, frame.activeLayers[0].name, true);
   
    await useLayerEffects(image, "frame", true);
   
   

    image.selection.deselect();
    const layer = await image.layers.getByName("frame")
   
    layer.translate((image.width - layer.bounds.width) / 2, (image.height - layer.bounds.height) / 2);


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

   
    let sourceLayer, destLayer;
    for (var i = 0; i < image.layers.length; i++) {
        if (image.layers[i].name === 'pic') {
            sourceLayer = image.layers[i];
        }
        if (image.layers[i].name === 'frame') {
            destLayer = image.layers[i];
        }
    }
   

    await sourceLayer.move(destLayer, constants.ElementPlacement.PLACEAFTER);
    await useLayerEffects(image, "frame", false);
    await image.trim(constants.TrimType.TRANSPARENT);
    await useLayerEffects(image, "frame", true);

   

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

    const width = await doc.width;
    const height = await doc.height;
    const framewindowWidth = transparentBounds.width;
    const framewindowHeight = transparentBounds.height;
    const framewindowVerticalBorder = (frame.width - framewindowWidth) / 2;
    const framewindowHorizontalBorder = (frame.height - framewindowHeight) / 2;
    const matLeftPixels = parseInt((units === "pixels") ? mLeft : mLeft * width / 100, 10);
    const matRightPixels = parseInt((units === "pixels") ? mRight : mRight * width / 100, 10);
    const matTopPixels = parseInt((units === "pixels") ? mTop : mTop * height / 100, 10);
    const matBottomPixels = parseInt((units === "pixels") ? mBottom : mBottom * height / 100, 10);
    const newTransparentWidth = width + matLeftPixels + matRightPixels;
    const sfw = newTransparentWidth / framewindowWidth;

    const newCanvasWidth = newTransparentWidth + 2 * sfw * framewindowVerticalBorder;
    const newTransparentHeight = height + matTopPixels + matBottomPixels;
    const sfh = newTransparentHeight / framewindowHeight;
    finalBorderHeight = sfh * framewindowHorizontalBorder;
    finalBorderWidth = sfw * framewindowVerticalBorder;

    const newCanvasHeight = newTransparentHeight + 2 * sfh * framewindowHorizontalBorder;
    const out = {
        "width": width,
        "height": height,
        "framewindowWidth": framewindowWidth,
        "framewindowHeight": framewindowHeight,
        "framewindowVerticalBorder": framewindowVerticalBorder,
        "framewindowHorizontalBorder": framewindowHorizontalBorder,
        "matLeftPixels": matLeftPixels,
        "matRightPixels": matRightPixels,
        "matTopPixels": matTopPixels,
        "matBottomPixels": matBottomPixels,
        "newCanvasWidth": newCanvasWidth,
        "newCanvasHeight": newCanvasHeight
    }
   




    await doc.resizeCanvas(newCanvasWidth, newCanvasHeight);
   
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
   
    title = userInput.title;

    matColor = userInput.matColor;
    matFloat = userInput.matFloat;

    fontChoice = userInput.fontChoice;
    mLeft = userInput.mLeft;
    mTop = userInput.mTop;
    mBottom = userInput.mBottom;
    mRight = userInput.mRight;
    units = userInput.units;
   

}

async function selectFrame() {
    await photoshop.action.batchPlay(
        [
            { "_obj": "select", "_target": [{ "_offset": -1, "_ref": "document" }] }
        ], {}
    );
}
async function destroyVars() {
    units = null;
    mTop = null;
    mRight = null;
    mBottom = null;
    mLeft = null;
    frame = null;
    image = null;
    title = null;
    titleOffset = null;
    bottomPadding = null;
    matColor = null;
    expansionRatio = null;
    matFloat = null;
    fontChoice = null;
    fontSize = null
    transparentBounds = null;
    document.getElementById('step1finished').style.display = 'none';
    document.getElementById('step2finished').style.display = 'none';
    document.getElementById('completedButton').style.display = 'none';
    finalBorderHeight=null;
    finalBorderWidth=null;

}

async function flattenImage(im) {
    app.activeDocument = image;
   
    await app.activeDocument.flatten();

   
}

async function getTransparent() {
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
                    "_enum": "channel",
                    "_ref": "channel",
                    "_value": "transparencyEnum"
                }
            },
            {
                "_obj": "inverse"
            }
        ], {}
    );

    const bounds = frame.selection.bounds;
   

    frame.selection.deselect();
    return bounds;
}



