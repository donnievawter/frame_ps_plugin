const { storage } = require('uxp');
const photoshop = require('photoshop');
const { constants } = require("photoshop");


let dialog, rgbFloat;


//const { app, core, action, fs } = require('photoshop');
const app = require('photoshop').app;
const core = require('photoshop').core;
const action = require('photoshop').action;
const fs = require('uxp').storage.localFileSystem;

const { executeAsModal } = core;
let frame, image, title, titleOffset, bottomPadding, matColor, expansionRatio, matFloat;


// Declare rgbColor variable outside the event listener for broader scope
let rgbColor = '';
document.getElementById('step1Button').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      // Step 1 handler code here
      frame = await app.activeDocument;
      console.log("activelayer name");
      console.log(frame.activeLayers[0].name);
      //turn off layer effects
      await useLayerEffects(frame, frame.activeLayers[0].name, false);
       const step1FinishedElement = document.getElementById('step1finished');
        step1FinishedElement.innerHTML = "Frame chosen: "+app.activeDocument.name;
        step1FinishedElement.style.display = 'block';



    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('step2Button').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      const suffix = app.activeDocument.name.substring(app.activeDocument.name.lastIndexOf(".")).toLowerCase();
      console.log(suffix);
        const step2FinishedElement = document.getElementById('step2finished');
        step2FinishedElement.innerHTML = "Image chosen: "+app.activeDocument.name;
        step2FinishedElement.style.display = 'block';

    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('completedButton').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      const suffix = app.activeDocument.name.substring(app.activeDocument.name.lastIndexOf(".")).toLowerCase();
      console.log(suffix);
      if (!(suffix === '.psd')) {
        await app.showAlert('Please save as a photoshop document before hitting completed.');
        return;
      }


      image = app.activeDocument;
      console.log(image);
      renameBackGround("originalPic");
      image.createLayerGroup({ fromLayers: image.layers, name: "pic" });
      // dialog0.close();
      const savedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
      if (savedPreferences) {
        document.getElementById('titleInput').value = savedPreferences.title || '';
        document.getElementById('titlePositionOffset').value = savedPreferences.titleOffset || '40';
        document.getElementById('bottomPadding').value = savedPreferences.bottomPadding || '100';
        document.getElementById('colorSwatch').style.backgroundColor = savedPreferences.matColor || '`rgb(255, 255, 255)`';
        document.getElementById('expansionRatio').value = savedPreferences.expansionRatio || '1.31';
        rgbColor = savedPreferences.matColor || '`rgb(255, 255, 255)`';
        rgbFloat = savedPreferences.matFloat || { red: 255, grain: 255, blue: 255 };
      }else{
       document.getElementById('titleInput').value = '';
        document.getElementById('titlePositionOffset').value =  '40';
        document.getElementById('bottomPadding').value = '100';
        document.getElementById('colorSwatch').style.backgroundColor =  '`rgb(255, 255, 255)`';
        document.getElementById('expansionRatio').value = '1.31';
        rgbColor =  '`rgb(255, 255, 255)`';
        rgbFloat =  { red: 255, grain: 255, blue: 255 };
  
      }
      dialog.show();
      // Completed handler code here
    } catch (error) {
      console.error("Error:", error);
    }
  });
});

document.getElementById('cancelButton').addEventListener('click', async () => {
  await photoshop.core.executeAsModal(async () => {
    try {
      //dialog0.close();
      // Cancel handler code here
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
      console.log("color picker");
      console.log(res[0]);
      rgbFloat = res[0].RGBFloatColor;
      console.log(rgbFloat);

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

      // Save user preferences to local storage
      const userInput = {
        title: document.getElementById('titleInput').value,
        titleOffset: document.getElementById('titlePositionOffset').value,
        bottomPadding: document.getElementById('bottomPadding').value,
        matColor: rgbColor,
        matFloat: rgbFloat,
        expansionRatio: document.getElementById('expansionRatio').value,
      };

      localStorage.setItem('userPreferences', JSON.stringify(userInput));

      console.log(localStorage.getItem('userPreferences'));
      await processResults(userInput);
      dialog.close();
    } catch (error) {
      console.error("error", error);
    }

  });
});

document.querySelector('button[type="reset"]').addEventListener('click', () => {
  // dialog.close();
  dialog1.close();
});
