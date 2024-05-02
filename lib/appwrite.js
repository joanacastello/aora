import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: 'com.aora.tutorial',
  projectId: '662678bd0681f4a2c84d',
  databaseId: '662679e1485b717e89dd',
  userCollectionId: '662679ffa605c8bdfb37',
  videoCollectionId: '66267a165396345560de',
  storageId: '66267b750b0e29698869'
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init the react-native SDK

// Init your react-native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    if(!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username)
    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )

    return newUser;
  } catch(error) {
    console.log(error);
    throw new Error(error);
  }
}

export const signIn = async (email, passowrd) => {
  try {
    const session = await account.createEmailSession(email, passowrd)
    return session;
  } catch (error) {
    throw new Error(error);
    
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if(!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
      console.log(error);
  }
}

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId
    )

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt', Query.limit(7))]
    )

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.search('title', query)]
    )

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}