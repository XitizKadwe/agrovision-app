// services/notificationFetcher.js

const cron = require('node-cron');
const Parser = require('rss-parser');
const Notification = require('../models/Notification');

const parser = new Parser();
const PIB_AGRICULTURE_FEED_URL = 'https://pib.gov.in/RssMain.aspx?ModId=3';

// This function will fetch and process the feed
const fetchAndSaveNotifications = async () => {
    console.log('📰 Checking for new scheme announcements...');
    try {
        const feed = await parser.parseURL(PIB_AGRICULTURE_FEED_URL);

        for (const item of feed.items) {
            // Check if this notification already exists in our database
            const existingNotif = await Notification.findOne({ sourceUrl: item.link });

            if (!existingNotif) {
                // If it doesn't exist, create a new one
                console.log(`✅ New item found: "${item.title}"`);
                const newNotification = new Notification({
                    title: item.title,
                    summary: item.contentSnippet || 'No summary available.',
                    sourceUrl: item.link,
                    publishDate: new Date(item.pubDate),
                });
                await newNotification.save();
            }
        }
    } catch (error) {
        console.error('❌ Error fetching or saving notifications:', error);
    }
};

// Schedule the job to run every 15 minutes.
// You can adjust the timing - e.g., '0 */4 * * *' for every 4 hours.
cron.schedule('*/15 * * * *', () => {
    fetchAndSaveNotifications();
});

console.log('🕒 Notification Fetcher scheduled to run every 15 minutes.');

// Export the function if you want to run it manually on server start
module.exports = { fetchAndSaveNotifications };