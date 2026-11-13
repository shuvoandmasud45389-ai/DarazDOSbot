const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const http = require('http');

// Render-এ Web Service হিসেবে চলার জন্য পোর্ট সেটআপ (যাতে ক্র্যাশ না করে)
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

  // মেসেজে daraz লেখা থাকলে কাজ শুরু করবে
  if (text && text.toLowerCase().includes('daraz')) {
    bot.sendMessage(chatId, "🔄 লিংক পেয়েছি! আপনার অ্যাকাউন্ট চেক করা হচ্ছে...");
    
    let browser;
    try {
      // ব্রাউজার লঞ্চ এবং Render-এর জন্য পারমিশন
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // কুকি সেট করা
      const cookies = JSON.parse(process.env.DARAZ_COOKIES);
      await page.setCookie(...cookies);

      // আপনার দেওয়া নতুন সঠিক লিংকে যাওয়া
      await page.goto('https://adsense.daraz.com.bd/index.htm#!/', { waitUntil: 'networkidle2' });

      // কাজ শেষ হলে ব্রাউজার বন্ধ করে মেসেজ দেওয়া
      await browser.close();
      bot.sendMessage(chatId, "✅ ব্রাউজার সফলভাবে আপনার অ্যাকাউন্টে ঢুকেছে! সার্ভার রেডি।");
      
    } catch (error) {
      console.error(error);
      if (browser) await browser.close();
      bot.sendMessage(chatId, "❌ দুঃখিত, ব্রাউজার অটোমেশনে কোনো সমস্যা হয়েছে।");
    }
  }
});
