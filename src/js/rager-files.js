
// TODO: Use parcel to build js files
// TODO: Add API environment variable, so you can make requests to both local and prod environments correctly
// TODO: (optional) Use parcel and netlify dev to replace gulp by configuring them to serve and reload static assets

const UPLOAD_ENDPOINT = '.netlify/functions/image'
const ANGER_FORM_ID = 'anger-upload'
const ANGER_UPLOAD_INPUT = 'anger-image'
const MAX_IMAGE_SIZE = 150000000 // 150MB in bytes

document.addEventListener('DOMContentLoaded', (_event) => {
  try {
    const API_BASE = window.location.origin;
    const angerForm = document.getElementById(ANGER_FORM_ID)
    if (!angerForm) {
      throw new Error(`No form element present with id ${ANGER_FORM_ID}`)
    }
  
    angerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const elements = event.target.elements
        if (!elements && !elements.length) {
          throw new Error('No form elements present to process image upload request.')
        }
  
        const fileInput = elements.namedItem(ANGER_UPLOAD_INPUT)
        if (!fileInput) {
          throw new Error(`No input element present with id ${ANGER_UPLOAD_INPUT}`)
        }
  
        // type = file
        const fileBlob = fileInput.files.item(0) // can be a ReadableStream, USVString, or ArrayBuffer
        console.log('fileBlob', fileBlob)
        if (fileBlob.size > MAX_IMAGE_SIZE) {
          throw new Error('Uploaded image must be smaller than 150MB.')
        }

        const buffer = await fileBlob.arrayBuffer() // Should return the blob as binary data in an ArrayBuffer
        // console.log(arrayBuff)
        // console.log(new Uint8Array(arrayBuff))
        const dataURL = await loadFile(fileBlob)
        const binaryData = new Uint8Array(buffer)

        // TODO: Make request
        const response = await fetch(`${API_BASE}/${UPLOAD_ENDPOINT}`, {
          method: 'POST',
          // convertDataURIToBinary: true,
          headers: {
            'Content-Type': 'application/octet-stream'
            // 'Content-Type': 'application/json'
          },
          body: binaryData,
        })

        const responseBody = await response.json()
        // TODO: Check response codes
        console.log(responseBody)
        // TODO: Add loading state to form
        // TODO: Add loading state to form

      } catch (error) {
        console.error(error)
      }
    })
  } catch (error) {
    // TODO: Display the error message to the client.
    console.error(error)
  }

});

// TODO: Choose and import a request library?

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
