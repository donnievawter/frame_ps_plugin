const { storage } = require('uxp');
const photoshop = require('photoshop');
const { constants } = require("photoshop");
let dialog, rgbFloat, fontChoice, fontSize,units,mTop,mLeft,mRight,mBottom,finalBorderWidth,finalBorderHeight;
async function buildFontDropdown() {
  //lets also set size
  const ol = document.getElementById('fontSize').options;
 
  ol.forEach(o => {
    if (o.value == fontSize) {
      o.selected = true;

    }
  });

  const dropdown = document.getElementById('fontDropDown');
  const fonts = app.fonts;
 
  fonts.forEach(font => {
    try {
      let option = document.createElement('option');
      option.textContent = font.name;
      option.value = [font.postScriptName, font.name];
      option.class = "white";
      if (fontChoice && font.postScriptName == fontChoice[0]) {
        option.selected = true;
      }

      dropdown.appendChild(option);

    } catch (e) {
      console.log(e);
    }// Use appendChild to add options

  });
}

document.getElementById('fontDropDown').addEventListener('change', function () {
  const selectedFont = this.value;
  
 
});
document.getElementById('fontSize').addEventListener('change', function () {
  fontSize = this.value;
 

});







//const { app, core, action, fs } = require('photoshop');
const app = require('photoshop').app;
const core = require('photoshop').core;
const action = require('photoshop').action;
const fs = require('uxp').storage.localFileSystem;

const { executeAsModal } = core;
let frame, image, title, titleOffset, bottomPadding, matColor, expansionRatio, matFloat,transparentBounds;


// Declare rgbColor variable outside the event listener for broader scope
let rgbColor = '';
document.getElementById('step1Button').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      // Step 1 handler code here
      frame = await app.activeDocument;
      
      await useLayerEffects(frame, frame.activeLayers[0].name, false);
      frame = app.activeDocument;
      const step1FinishedElement = document.getElementById("step1finished");
      step1FinishedElement.innerHTML = "Frame chosen: " + app.activeDocument.name;
      step1FinishedElement.style.display = 'block';
      // await calculateFrameThickness(frame);
    
     transparentBounds= await getTransparent();
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('step2Button').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      const suffix = app.activeDocument.name.substring(app.activeDocument.name.lastIndexOf(".")).toLowerCase();
     
      const step2FinishedElement = document.getElementById('step2finished');
      step2FinishedElement.innerHTML = "Image chosen: " + app.activeDocument.name;
      step2FinishedElement.style.display = 'block';
      document.getElementById('completedButton').style.display = 'block';
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('completedButton').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
     


      image = app.activeDocument;
      
      renameBackGround("originalPic");
      image.createLayerGroup({ fromLayers: image.layers, name: "pic" });
     
      const savedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
    
      if (savedPreferences) {
        document.getElementById('titleInput').value = savedPreferences.title || '';
        document.getElementById('mLeftInput').value = savedPreferences.mLeft || '10';
        document.getElementById('mRightInput').value = savedPreferences.mRight || '10';
        document.getElementById('mTopInput').value = savedPreferences.mTop || '10';
        document.getElementById('mBottomInput').value = savedPreferences.mBottom || '10';
        document.getElementById('units').value = savedPreferences.units || 'percentage';
       
        document.getElementById('colorSwatch').style.backgroundColor = savedPreferences.matColor || '`rgb(255, 255, 255)`';
       
        rgbColor = savedPreferences.matColor || '`rgb(255, 255, 255)`';
        rgbFloat = savedPreferences.matFloat || { red: 255, grain: 255, blue: 255 };
        fontChoice = savedPreferences.fontChoice;
        fontSize = savedPreferences.fontSize || 24;
      } else {
        document.getElementById('mLeftInput').value = '10';
        document.getElementById('mRightInput').value = '10';
        document.getElementById('mTopInput').value = '10';
        document.getElementById('mBottomInput').value = '10';
        document.getElementById('units').value = 'percentage';

        document.getElementById('titleInput').value = '';
        
        document.getElementById('colorSwatch').style.backgroundColor = '`rgb(255, 255, 255)`';
       
        rgbColor = '`rgb(255, 255, 255)`';
        rgbFloat = { red: 255, grain: 255, blue: 255 };
        fontChoice = ["BodoniSvtyTwoSCITCTT-Book", "Bodoni 72 Smallcaps Book"];
        fontSize = 24;
      }
      
      buildFontDropdown();
      dialog.show();
      
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('cancelButton').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      destroyVars();
     
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
document.getElementById('bailout').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      destroyVars();
      dialog.close();
    
    } catch (error) {
      console.error("Error:", error);
    }
  });
});


// Event listener for Choose Color button
document.getElementById('chooseColor').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      // Open color picker
      const openPicker = {
        _target: { _ref: "application" },
        _obj: "showColorPicker"
      };
      const res = await photoshop.action.batchPlay([openPicker], {});
    
      rgbFloat = res[0].RGBFloatColor;
    
      // Use 'grain' if it exists, otherwise fall back to 'green'
      const greenValue = rgbFloat.grain !== undefined ? rgbFloat.grain : rgbFloat.green;
      rgbColor = `rgb(${rgbFloat.red}, ${greenValue}, ${rgbFloat.blue})`;
      document.getElementById('colorSwatch').style.backgroundColor = rgbColor;
    } catch (error) {
      console.error("Error selecting color:", error);
    }
  })
});

async function showPhotoshop() {
  await photoshop.core.executeAsModal(async () => {
    app.bringToFront();
  });

}

document.addEventListener('DOMContentLoaded', () => {
  // Call this function when your plugin initializes



  dialog0 = document.getElementById('initializeDialog');
  showPhotoshop();

  //dialog1 = document.getElementById('initializeDialog');
  dialog = document.getElementById('exampleDialog');
  //dialog1.show();

});
document.getElementById('wearedone').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      // Retrieve user preferences from local storage and prefill the form
      fontChoice = document.getElementById("fontDropDown").value || ["BodoniSvtyTwoSCITCTT-Book", "Bodoni 72 Smallcaps Book"];
      // Save user preferences to local storage
      const userInput = {
        title: document.getElementById('titleInput').value,
        matColor: rgbColor,
        matFloat: rgbFloat,
        fontChoice: fontChoice,
        fontSize: document.getElementById('fontSize').value,
        mLeft: document.getElementById('mLeftInput').value,
        mRight: document.getElementById('mRightInput').value,
        mTop: document.getElementById('mTopInput').value,
        mBottom: document.getElementById('mBottomInput').value,
        units: document.getElementById('units').value


      };

      localStorage.setItem('userPreferences', JSON.stringify(userInput));

      
      await processResults(userInput);
      dialog.close();
    } catch (error) {
   
      console.error("error", error);
    }

  });
});
