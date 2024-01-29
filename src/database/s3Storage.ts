const AWS = require('aws-sdk');
import { ChatData } from '../types'; // Import the ChatData type
const s3 = new AWS.S3();

// Function to fetch subscribed chat IDs from S3
async function getSubscribedChatIds() {
  try {
    console.log(`Fetching subscribed chat IDs from S3 bucket ${process.env.S3_BUCKET}...`);
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'subscribed-chat-ids.json',
    }).promise();

    return new Set(JSON.parse(s3Object.Body.toString()));
  } catch (error) {
    console.error('Error fetching subscribed chat IDs from S3:', error);
    return new Set(); // Return an empty set if there's an error
  }
}
export { getSubscribedChatIds };

// Function to save subscribed chat IDs to S3
async function saveSubscribedChatIds(subscribedChatIds: Set<number>): Promise<void> {
  try {
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'subscribed-chat-ids.json',
      Body: JSON.stringify(Array.from(subscribedChatIds)),
    }).promise();
  } catch (error) {
    console.error('Error saving subscribed chat IDs to S3:', error);
    throw error; // Rethrow the error after logging
  }
}
export { saveSubscribedChatIds };

async function getChatData(chatId: string): Promise<ChatData> {
  try {
    const s3Path = `${process.env.CHAT_DATA_FOLDER}/${chatId}.json`;
    console.log(`Fetching chat data from S3 bucket ${process.env.S3_BUCKET}, path: ${s3Path}...`);
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: s3Path,
    }).promise();

    // Parse the data from binary to json
    return JSON.parse(s3Object.Body.toString());
  } catch (error) {
    console.error('Error fetching chat data from S3:', error);
    
    // Return chatData object with chatId and empty subscriptions array
    return { chatId: chatId, subscriptions: [] };
  }
}
export { getChatData };

// Function to save chat data to S3
async function saveChatData(chatData: ChatData) {
  try {
    const s3Path = `${process.env.CHAT_DATA_FOLDER}/${chatData.chatId}.json`;
    console.log(`Saving chat data to S3 bucket ${process.env.S3_BUCKET}, path: ${s3Path}...`);
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: s3Path,
      Body: JSON.stringify(chatData),
      ContentType: 'application/json',
    }).promise();
  } catch (error) {
    console.error('Error saving chat data to S3:', error);
  }
}
export { saveChatData };