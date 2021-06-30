// Endpoints
const GET_ENDPOINT = '.netlify/functions/get-image';
const UPLOAD_ENDPOINT = '.netlify/functions/post-image';

// Constants
const ANGER_FORM_ID = 'anger-upload';
const ANGER_UPLOAD_INPUT_ID = 'anger-image';
const ANGER_FORM_BUTTON_ID = 'anger-submit';
const ANGER_GALLERY_ID = 'anger-gallery';
const ANGER_CONTAINER_ID = 'anger-container';
const MAX_IMAGE_UPLOAD_SIZE = 15000000; // 15MB in bytes
const MAX_IMAGE_DIMENSION = 800; // in pixels
const MAX_BYTE_SIZE = 1048487 // imposed by Firebase, unfortunately
const FORM_NOTICE_CLASS = 'form-notice';
const FORM_ERROR_MESSAGE = `<span class="form-error">Error:</span> Poop! There was an issue uploading your image. If your image is larger than 15mb, you'll need to resize it. Try again, or <a class="plain" href="mailto:lizzthabet@gmail.com?Subject=${encodeURI('Rager upload error')}" target="_blank">email me your drawing</a> and I'll upload it for you.`
const FORM_SUCCESS_MESSAGE = `<span class="form-success">Upload successful!</span> <i>Let the rivers of our destruction join & flood the whole earth. 💦</i>`

document.addEventListener('DOMContentLoaded', async (_event) => {
  try {
    const angerForm = document.getElementById(ANGER_FORM_ID)
    const angerButton = document.getElementById(ANGER_FORM_BUTTON_ID)
    if (!angerForm) {
      throw new Error(`No form element present with id ${ANGER_FORM_ID}`)
    }
    angerForm.addEventListener('change', (_event) => {
      // Clear any error or success messages when its input changes
      displayFormMessage(angerForm, 'none')
    })
  
    angerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        toggleButtonLoading(angerButton, true)
        displayFormMessage(angerForm, 'none')

        const elements = event.target.elements;
        if (!elements && !elements.length) {
          throw new Error('No form elements present to process image upload request.')
        }
  
        const fileInput = elements.namedItem(ANGER_UPLOAD_INPUT_ID);
        if (!fileInput) {
          throw new Error(`No input element present with id ${ANGER_UPLOAD_INPUT_ID}`)
        }

        const fileBlob = fileInput.files.item(0);
        if (fileBlob.size > MAX_IMAGE_UPLOAD_SIZE) {
          throw new Error('Uploaded image must be smaller than 15MB.')
        }

        await uploadAndDisplayImage(fileBlob)

        toggleButtonLoading(angerButton, false)
        displayFormMessage(angerForm, 'success')

      } catch (error) {
        console.error(error)

        toggleButtonLoading(angerButton, false)
        displayFormMessage(angerForm, 'error')
      }
    });

    // Uncomment for book launch
    await displayRageGallery();
  } catch (error) {
    console.error(error)
  }

});

// Main
async function displayRageGallery() {
  try {
    const API_BASE = window.location.origin;
  
    // Get all images and render
    const response = await fetch(`${API_BASE}/${GET_ENDPOINT}`, { method: 'GET' });
  
    if (response.status >= 300) {
      throw new Error(`Fetching images failed with status ${response.status}`);
    }
  
    const parsedResponse = await response.json();
    if (parsedResponse.images) {
      const container = document.getElementById(ANGER_GALLERY_ID);
      const columnContainer = document.createElement('div');
      columnContainer.classList.add('col-xs-12');
  
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('img-container');
      imageContainer.id = ANGER_CONTAINER_ID;
  
      parsedResponse.images.forEach(url => {
        const { imageWrapper } = createImage(url);
        imageContainer.appendChild(imageWrapper);
      });
  
      const containerHeading = document.getElementById(`${ANGER_GALLERY_ID}-heading`)
      containerHeading.classList.remove('hidden')
  
      columnContainer.appendChild(imageContainer);
      container.appendChild(columnContainer);
    }
  } catch (error) {
    // Don't do anything for now
  }
};

async function uploadAndDisplayImage(fileBlob) {
  const dataURL = await extractDataUrl(fileBlob);

  const API_BASE = window.location.origin;
  const response = await fetch(`${API_BASE}/${UPLOAD_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: dataURL }),
  });

  if (response.status >= 300) {
    // TODO: Handle size error specifically
    /**
    postImage errored out with status undefined: Error: 3 INVALID_ARGUMENT: The value of property "url" is longer than 1048487 bytes.
      details: 'The value of property "url" is longer than 1048487 bytes.',
     */
    throw new Error(`Uploading image failed with status ${response.status}`);
  }

  const responseBody = await response.json();

  // Append new image to DOM
  if (responseBody.image) {
    const imageContainer = document.getElementById(ANGER_CONTAINER_ID);
    // Only display the image if the image gallery is present
    if (imageContainer) {
      const { imageWrapper } = createImage(dataURL);
      imageContainer.appendChild(imageWrapper);
    }
  }
};

// Helpers
async function extractDataUrl(file) {
  const dataURL = await loadFile(file);
  const resizedDataURL = await resizeImage(dataURL, file.size);
  return resizedDataURL;
};

function loadFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    // First, set the onload callback
    fileReader.onload = () => resolve(fileReader.result)
    fileReader.onerror = () => reject('FileReader failed to parse data')
    // Second, parse the file blob as data URL
    fileReader.readAsDataURL(file)
  })
}

function loadImage (dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    // First, set the onload callback
    image.onload = () => resolve(image)
    image.onerror = () => reject('Image failed to load')
    // Second, trigger the image load by setting its source
    image.src = dataUrl;
  });
};

async function resizeImage(dataUrl) {
  // Determine the image's current size
  const image = await loadImage(dataUrl);

  // Adjust the dimensions depending on the max dimension
  // or the image's largest dimension, whatever's smallest
  let { height, width } = calculateSize(image, Math.min(Math.max(image.height, image.width), MAX_IMAGE_DIMENSION));
  
  // Draw the image scaled down
  let resizedDataURL = drawResizedImage(image, height, width)
  let resizeAttempts = 1

  // If the resized image exceeds max upload byte size, incrementally resize until it doesn't
  // This is hacky... but okay enough
  while (resizedDataURL.length > MAX_BYTE_SIZE && resizeAttempts <= 5) {
    const { height: smallerHeight, width: smallerWidth } = calculateSize(image, Math.max(height, width) - 50)
    height = smallerHeight
    width = smallerWidth
    resizedDataURL = drawResizedImage(image, height, width)
    resizeAttempts++
  }

  // Note: if the image resize isn't successful, it will error out downstream

  // Extract the dataUrl data from the resized image
  return drawResizedImage(image, height, width);
}

function calculateSize(image, maxDimension) {
  let height, width;
  if (image.height >= image.width) {
    const aspectRatio = image.width / image.height;
    height = maxDimension;
    width = aspectRatio * maxDimension;
  } else {
    const aspectRatio = image.height / image.width;
    height = aspectRatio * maxDimension;
    width = maxDimension;
  }

  return { height, width };
}

function drawResizedImage(image, height, width) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width
  canvas.height = height

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Extract the dataUrl data from the canvas
  return canvas.toDataURL();
}

function createImage(dataURL) {
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('img-wrapper');

  const image = document.createElement('img');
  image.src = dataURL;
  image.classList.add('img-self');

  imageWrapper.appendChild(image);

  return { image, imageWrapper };
}

function toggleButtonLoading(button, loading) {
  if (!button) {
    console.warn('No submit button found for anger upload form.')

    return
  }

  button.disabled = loading
  button.innerText = loading ? 'Loading...' : 'Upload'
}

function displayFormMessage(container, messageType) {
  if (messageType === 'none') {
    const messages = document.getElementsByClassName(FORM_NOTICE_CLASS)

    while (messages.length > 0) {
      container.removeChild(messages.item(0))
    }

  } else if (messageType === 'error' || messageType === 'success') {
    const messageNode = document.createElement('p')
    messageNode.classList.add(FORM_NOTICE_CLASS)
    messageNode.attributes['role'] = 'alert'
    messageNode.innerHTML = messageType === 'error' ? FORM_ERROR_MESSAGE : FORM_SUCCESS_MESSAGE

    container.appendChild(messageNode)
  } else {
    console.warn(`Cannot display form message with unknown type ${messageType}`)
  }
}
