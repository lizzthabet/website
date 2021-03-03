const { Dropbox } = require("dropbox");

const FOLDER_PATH = "/upload-tests";

/**
 * Upload an image to a Dropbox folder
 * @param {Object} event Information about an incoming request
 * @param {string} event.path Path parameter
 * @param {string} event.httpMethod Incoming request’s method name
 * @param {Object<string,string>} event.headers Incoming request’s headers
 * @param {Object<string,string>} event.queryStringParameters Incoming request’s query string parameters
 * @param {string} [event.body] A JSON string of the request payload
 * @param {boolean} event.isBase64Encoded A boolean that indicates if the applicable request payload is Base64-encoded
 * @param {Object} context Information about the context in which the function was called
 * @returns {Object} A response object with `statusCode` and `body` properties
 */
exports.handler = async function (event, _context) {

  try {
    // const requestBody = JSON.parse(event.body)
    // if (!requestBody && !requestBody.image) {
    //   const formatError = new Error('Request is missing `image` property with data');
    //   formatError.status = 400;
    //   throw(formatError);
    // }

    console.log(event.body)
    console.dir(event.body)
    const binaryData = new Uint8Array(event.body)
    console.log('binaryData', binaryData)

    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      accessToken: process.env.DROPBOX_ACCESS_TOKEN
    });

    // Try converting the base64encoded string to binary

    const requestPayload = {
      autorename: true,
      contents: binaryData,
      mode: 'add',
      mute: false,
      path: `${FOLDER_PATH}/local-test.jpg`,
      strict_conflict: false,
    }

    const response = await dbx.filesUpload(requestPayload);
    console.log(response)
    /**
    result: {
    name: 'local-test.jpg',
    path_lower: '/upload-tests/local-test.jpg',
    path_display: '/upload-tests/local-test.jpg',
    id: 'id:MoW-t2cW_PwAAAAAAAAOFA',
    client_modified: '2021-03-02T16:20:34Z',
    server_modified: '2021-03-02T16:20:34Z',
    rev: '015bc901d337f0800000002209391a0',
    size: 15,
    is_downloadable: true,
    content_hash: '87bfbb905f228845cfb691920551882f446042da2ef9576e26ca97c5374c3eef'
     */

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Hello!' })
    };

  } catch (error) {
    console.error(`postImage errored out with status ${error.status}:`, error.error);

    let message = error && error.message || 'Unknown error';
    if (error.error && error.error.error) {
      message += `: ${JSON.stringify(error.error.error)}`;
    }

    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ message })
    };
  }
};
