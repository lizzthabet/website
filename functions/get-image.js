const admin = require('firebase-admin');

const FB_IMAGE_COLLECTION = process.env.FIREBASE_PROJECT_COLLECTION;

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
    // QuerySnapshot docs: https://firebase.google.com/docs/reference/js/firebase.firestore.QuerySnapshot
    const snapshot = await db.collection(FB_IMAGE_COLLECTION)
      .where('live', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();

    const images = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.url) {
        images.push(data.url)
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ images }),
    };

  } catch (error) {
    console.error(`getImage errored out:`, error);

    const message = error && error.message || 'Unknown error';

    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ message })
    };
  }
};
