const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Daraz Bot is Running!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && (text.includes('daraz.') || text.includes('daraz.com.bd'))) {
        bot.sendMessage(chatId, "🔄 লিংক পেয়েছি! আপনার অ্যাকাউন্ট চেক করা হচ্ছে...");
        
        let browser;
        try {
            browser = await puppeteer.launch({ 
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            });
            const page = await browser.newPage();
            
            const cookies = JSON.parse(process.env.DARAZ_COOKIES);
            await page.setCookie(...cookies);

            await page.goto('https://sense.daraz.com.bd', { waitUntil: 'networkidle2' });
            
            await browser.close();
            bot.sendMessage(chatId, "✅ ব্রাউজার সফলভাবে আপনার অ্যাকাউন্টে ঢুকেছে! সার্ভার রেডি।");
            
        } catch (error) {
            console.error(error);
            if (browser) await browser.close();
            bot.sendMessage(chatId, "❌ দুঃখিত, ব্রাউজার অটোমেশনে কোনো সমস্যা হয়েছে।");
        }
    }
});
