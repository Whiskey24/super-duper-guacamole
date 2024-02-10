const AWS = require('aws-sdk');
import { ChatData } from '../types'; // Import the ChatData type
const s3 = new AWS.S3();

async function getChatData(chatId: number): Promise<ChatData> {
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

// Get all json files that match the "chatID" type (in case other joson files exist) and return those in a list
async function getAllChatData(): Promise<ChatData[]> {
  try {
    console.log(`Fetching all chat data from S3 bucket ${process.env.S3_BUCKET}, path: ${process.env.CHAT_DATA_FOLDER}...`);
    
    // List all objects in the specified folder
    const response = await s3.listObjectsV2({
      Bucket: process.env.S3_BUCKET,
      Prefix: process.env.CHAT_DATA_FOLDER,
    }).promise();

    const chatDataList: ChatData[] = [];

    // Iterate through each object
    for (const object of response.Contents || []) {
      const key = object.Key || '';
      
      // Check if the object is a JSON file
      if (key.endsWith('.json')) {
        // Fetch the object data
        const s3Object = await s3.getObject({
          Bucket: process.env.S3_BUCKET,
          Key: key,
        }).promise();

        // Parse the data from binary to JSON
        const jsonData = JSON.parse(s3Object.Body?.toString() || '');

        // Check if the parsed JSON data matches the ChatData type
        if (isChatData(jsonData)) {
          // Add the chatData to the list
          chatDataList.push(jsonData);
        }
      }
    }

    return chatDataList;
  } catch (error) {
    console.error('Error fetching all chat data from S3:', error);
    return [];
  }
}

// Function to check if an object matches the ChatData type
function isChatData(obj: any): obj is ChatData {
  return (
    typeof obj === 'object' &&
    typeof obj.chatId === 'string' &&
    Array.isArray(obj.subscriptions)
  );
}

export { getAllChatData };
