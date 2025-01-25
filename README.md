# frame_ps_plugin
Automated generation of a virtual frame for an image

This project is designed to add virtual frames to an image in Photoshop.

### Some of the features:
* Create the base frame with Generative Fill or use your own.
* Works with arbitrary aspect ratios
* Adds text field for the title
* Adds a mat with a user chosen color

## Installation
  This is a photoshop plug-in and you need the ccx file.
  It will be available in the Photoshop Marketplace or if you fork the code you can generate your own

## Useage
    After installation you go to Plugins>Add Frame>Add Frame

## Setting the items

  You will be presented with this panel  
  
   ![Choose Files](assets/choosefiles.png)
1. Create the base frame or choose a file. To create a frame [See here](#Creating-a-Base-Frame)  
1. Choose the frame file and make it active.
2. Press "Step 1" button.
3. Note that any layer effects on the frame will be disabled. This may change the appearance of the frame. Don't worry. They will be re-enabled after processing.
3. Open the image you want to frame
4. Press "Step 2" button
5. Press the "Process" button
6. Press the "Clear" button if you want to change files.

## Setting the parameters
  You will be presented with this panel  
  
   ![Choose parameters](assets/parameters.png)
1. There are two sections to the panel- the mat and the title
2. For the mat you choose the size for the four sides.
3. Choose your units - pixels or percent. Percent is a percentage of the image size.
4. Choose the mat color with the Choose Color button which opens a color picker.
5. **IT IS IMPORTANT TO CLOSE THE COLOR PICKER TO APPLY YOUR CHOICE**
6. For the title you choose the text, the font using a dropdown, the color using a dropdown, and the color using a color picker.
7. When you are done click Ok or bailout with Cancel
8. The screen may show the image in various states while building the result. Don't panic if it looks strange.


## Working with the included Frame
Although you can certainly use your own frames, the included one is pretty flexible. If you use your own frame, the only real requirement is that it be transparent in the center. This means you can't use a jpg because they don't allow for transparancy. I suspect a psd or tiff will be the common choice, but you could use a png. The included frames use layer styles and you can change the frame color but still keep the grain by modifying the Color Overlay. You can do this on the original frame file or on the image generated by the script. Beware that in the process, layer effects are turned off to aid in sizing. This may change the initial appearance of your frame and startle you. Don't worry! Layer effect are turned on after copying. 

## Post Processing
The generated file will have the following layers:
![Layers](assets/layers.png)

1. title: a text layer.
2. frame: the frame.
3. pic: A Layer group which contains your original image. If the original image had a background layer it will be renamed originalPic
4. mat color: filed with the color you chose.

You can alter these layers as you like. Changing the font, size and location of the title, the color of the mat, etc. You can also change the frame color by editing the layer properties of "frame".

## Creating a Base Frame
![Create](assets/createframe.png)
1. Fill out the dimensions of the frame in pixels. You should specify something roughly the size of your images to avoid pixelization when the frame is stretched around the image.
2. Choose the border widths.
3. Generative Fill is used to create the borders. Leave the prompt blank if you want a solid black border.
4. If you choose editable then the build process will pause while you interact with generative fill. Otherwise it will just take the first option.
5. Click Create Frame to generate the frame.
6. [Go to step 3](#setting-the-items)
