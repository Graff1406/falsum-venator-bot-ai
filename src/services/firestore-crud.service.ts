import { db } from '../providers/firebase.provider';
import { DBCollections } from '../utils/enums.util';

export const updateTelegramChannelField = async (
  username: string,
  field: string,
  value: any
): Promise<void> => {
  try {
    const querySnapshot = await db
      .collection(DBCollections.TELEGRAM_CHANNELS)
      .where('username', '==', username)
      .get();

    if (querySnapshot.empty) {
      console.log(`No document found for username: ${username}`);
      return;
    }

    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { [field]: value });
    });

    await batch.commit();
    console.log(
      `Updated ${field} for username: ${username} with value:`,
      value
    );
  } catch (error) {
    console.error(`Error updating ${field} for username: ${username}`, error);
  }
};

export const getCollectionDocuments = async <T>(
  collectionName: string
): Promise<T[] | null> => {
  try {
    const snapshot = await db.collection(collectionName).get();

    return snapshot.empty
      ? []
      : (snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[]);
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    return null;
  }
};

export const addDocument = async <
  T extends FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>,
>(
  collectionName: string,
  data: T,
  docName?: string
): Promise<string> => {
  try {
    const collectionRef = db.collection(collectionName);
    const docRef = docName ? collectionRef.doc(docName) : collectionRef.doc();

    await docRef.set(data);

    console.log(`Document added to "${collectionName}" with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const getDocument = async <T extends FirebaseFirestore.DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.warn(
        `⚠️ Document "${docId}" not found in collection "${collectionName}"`
      );
      return null;
    }

    console.log(`📄 Document "${docId}" fetched from "${collectionName}"`);
    return docSnapshot.data() as T;
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    throw error;
  }
};

export const updateDocument = async <
  T extends Partial<FirebaseFirestore.DocumentData>,
>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.warn(
        `⚠️ Document "${docId}" not found in collection "${collectionName}"`
      );
      return;
    }

    await docRef.update(data);
    console.log(
      `✅ Document "${docId}" updated successfully in "${collectionName}"`
    );
  } catch (error) {
    console.error('❌ Error updating document:', error);
    throw error;
  }
};
