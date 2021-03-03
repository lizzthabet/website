const { Dropbox } = require("dropbox");

const FOLDER_PATH = "/upload-tests";

/**
 * Fetch a list of image thumbnails for a Dropbox folder
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
exports.handler = async function (_event, _context) {

  try {
    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      accessToken: process.env.DROPBOX_ACCESS_TOKEN
    });

    const listFolderResponse = await dbx.filesListFolder({ path: FOLDER_PATH })
    if (!listFolderResponse || !listFolderResponse.result || !listFolderResponse.result.entries) {
      throw new Error('Image files are unavailable at this time.');
    }

    // TODO: Split into multiple requests if listFolderResponse is > 25

    const getThumbnailsRequest = listFolderResponse.result.entries.map(file => {
      return {
        path: file["path_lower"] ? file["path_lower"] : `${PATH}/${file.name.toLowerCase()}`,
        format: 'png',
        size: 'w960h640', // Other options include 'w1024h768'
        mode: 'strict' // Other options include  'bestfit' | 'fitone_bestfit'
      };
    });

    const getThumbnailsResponse = await dbx.filesGetThumbnailBatch({ entries: getThumbnailsRequest});

    if (!getThumbnailsResponse || !getThumbnailsResponse.result || !getThumbnailsResponse.result.entries) {
      throw new Error('Image thumbnails are unavailable at this time.');
    }

    // `thumbnail`: A string containing the base64-encoded thumbnail data for this file.
    const thumbnails = getThumbnailsResponse.result.entries.map(image => image.thumbnail);

    return {
      statusCode: 200,
      body: JSON.stringify({ thumbnails })
    };

  } catch (error) {
    console.error(`listFiles errored out with status ${error.status}:`, error.error);

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
