const admin = require('firebase-admin');

const FB_IMAGE_COLLECTION = process.env.FIREBASE_PROJECT_COLLECTION;
const DB_VERSION = '1'; // Increment every time there are significant changes

// Initialize the Firebase app
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

/**
 * Upload an image to a Firebase store
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
    const imageData = JSON.parse(event.body)

    const createdAt = new Date();
    const fileUpload = db.collection(FB_IMAGE_COLLECTION).doc(createdAt.toUTCString());

    await fileUpload.set({
      url: imageData.url,
      live: true,
      version: DB_VERSION,
      timestamp: admin.firestore.Timestamp.fromDate(createdAt)
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ image: imageData.url })
    };

  } catch (error) {
    console.error(`postImage errored out`, error);

    const message = error && error.message || 'Unknown error';

    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ message })
    };
  }
};
