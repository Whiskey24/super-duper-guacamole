import { getAllChatData } from '../database/s3Storage';
import { beleggerNl } from './webScraping';
import { sendMessageToChat } from '../bot/bot';
import subscriptions from '../subscriptions.json';

export const checkSubscriptionsAndSendMessage = async function checkSubscriptionsAndSendMessage() {
    try {
        // Get all chat data
        const chatDataList = await getAllChatData();

        // Collect all subscription IDs mentioned in chat data
        const mentionedSubscriptionIds = new Set();
        chatDataList.forEach(chatData => {
            chatData.subscriptions.forEach(subscription => {
                mentionedSubscriptionIds.add(subscription.id);
            });
        });

        // Fetch webpage data only for mentioned subscriptions
        const fetchedWebpageDataMap = new Map();
        await Promise.all(subscriptions.filter(subscription => mentionedSubscriptionIds.has(subscription.id)).map(async subscription => {
            try {
                const webpageData = await beleggerNl(subscription.id);
                fetchedWebpageDataMap.set(subscription.id, webpageData);
            } catch (error) {
                console.error(`Error fetching webpage data for subscription ID ${subscription.id}:`, error);
            }
        }));

        // Iterate over chat data and send messages
        for (const chatData of chatDataList) {
            for (const subscription of chatData.subscriptions) {
                // Fetch fetched webpage data for current subscription ID
                const webpageData = fetchedWebpageDataMap.get(subscription.id);
                if (!webpageData) {
                    console.warn(`Webpage data not found for subscription ID ${subscription.id}`);
                    continue; // Skip if webpage data not found
                }

                // Check if the "Koers" value meets the specified thresholds
                const thresholds = subscriptions.find(sub => sub.id === subscription.id);
                if (!thresholds) {
                    console.warn(`Thresholds not found for subscription ID ${subscription.id}`);
                    continue; // Skip if thresholds not found
                }

                const koersValue = parseFloat(webpageData.keyValues["Koers"]);
                if (!isNaN(koersValue) && (koersValue > thresholds.highThreshold || koersValue < thresholds.lowThreshold)) {
                    // Construct message to send
                    const message = `De "Koers" voor ${subscription.name} is nu ${koersValue}\n\n[More Details](${webpageData.url})`;

                    // Send message to the chat
                    await sendMessageToChat(chatData.chatId, message);
                }
            }
        }
    } catch (error) {
        console.error('Error checking subscriptions and sending messages:', error);
    }
}
