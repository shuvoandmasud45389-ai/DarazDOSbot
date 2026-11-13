const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Daraz Bot is running!');
    res.end();
}).listen(process.env.PORT || 8080);

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("বট চালু হয়েছে...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.toLowerCase().includes('daraz')) {
    bot.sendMessage(chatId, "🔄 লিংক পেয়েছি! আপনার অ্যাকাউন্ট চেক করা হচ্ছে...");
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();

      const cookies = JSON.parse(process.env.DARAZ_COOKIES);
      await page.setCookie(...cookies);

      // পেজ লোড হওয়ার সময় বাড়ানো হয়েছে (৬০ সেকেন্ড) এবং লোডিং সহজ করা হয়েছে
      await page.goto('https://adsense.daraz.com.bd/index.htm#!/', { waitUntil: 'domcontentloaded', timeout: 60000 });

      await browser.close();
      bot.sendMessage(chatId, "✅ ব্রাউজার সফলভাবে আপনার অ্যাকাউন্টে ঢুকেছে! সার্ভার রেডি।");
      
    } catch (error) {
      if (browser) await browser.close();
      // আসল সমস্যাটি এখন টেলিগ্রামে মেসেজ হিসেবে আসবে
      bot.sendMessage(chatId, "❌ Error: " + error.message);
    }
  }
});
