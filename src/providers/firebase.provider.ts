import admin from 'firebase-admin';
// import data from '@/config/falsum-venator-ai-app-firebase-adminsdk.json';

const serviceAccount = {
  type: 'service_account',
  project_id: 'falsum-venator-ai-app',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40falsum-venator-ai-app.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
  client_id: process.env.FIREBASE_CLIENT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const str = JSON.stringify(serviceAccount);
const data = JSON.parse(str);

admin.initializeApp({
  credential: admin.credential.cert(data),
});

export const db = admin.firestore();
