import { getAllChatData } from '../database/s3Storage';
import { beleggerNl } from './webScraping';
import { sendMessageToChat } from '../bot/bot'; 

export const checkSubscriptionsAndSendMessage = async function checkSubscriptionsAndSendMessage() {
  try {
      // Get all chat data
      const chatDataList = await getAllChatData();
      
      // Iterate over each chat's subscriptions
      for (const chatData of chatDataList) {
          for (const subscription of chatData.subscriptions) {
              // Fetch information from Belegger.nl for the subscription's ID
              const webpageData = await beleggerNl(subscription.id);
              
              // Check if the "Koers" value meets the specified thresholds
              const koersValue = parseFloat(webpageData.keyValues["Koers"]);
              if (!isNaN(koersValue) && (koersValue > subscription.highThreshold || koersValue < subscription.lowThreshold)) {
                  // Construct message to send
                  const message = `De "Koers" voor ${subscription.name} is nu ${koersValue}\n\n[More Details](${webpageData.url}`;

                  // Send message to the chat
                  await sendMessageToChat(chatData.chatId, message);
              }
          }
      }
  } catch (error) {
      console.error('Error checking subscriptions and sending messages:', error);
  }
}
