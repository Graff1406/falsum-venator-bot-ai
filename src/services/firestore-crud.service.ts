import { db } from '@/providers/firebase.provider';
import { DBCollections } from '@/utils/enums.util';

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
