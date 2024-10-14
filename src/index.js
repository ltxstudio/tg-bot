addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const data = await request.json();
    const message = data.message;
    const chatId = message.chat.id;

    if (message.text.startsWith('/cmds')) {
        const commands = `
/generate_image <prompt> - Generate an AI image
/chat <message> - Chat with AI
/text_to_speech <text> - Convert text to speech
/summarize <text> - Summarize text
/generate_text <prompt> - Generate text with AI
/image_to_text <image> - Extract text from an image
/asr <audio> - Automatic speech recognition
/detect_objects <image> - Detect objects in an image
/bin_check <bin> - Check BIN information
/test_card - Generate a test card
/random_user - Generate a random user profile
/yt_download <url> - Download YouTube video
/ip_info <ip> - Get IP information
/broadcast <message> - Send broadcast message (admin only)
        `;
        await sendTelegramMessage(chatId, commands);
    } else if (message.text.startsWith('/generate_image')) {
        const imageUrl = await generateAIImage(message.text);
        await sendTelegramMessage(chatId, `Here is your AI-generated image: ${imageUrl}`);
    } else if (message.text.startsWith('/chat')) {
        const response = await chatWithAI(message.text);
        await sendTelegramMessage(chatId, response);
    } else if (message.text.startsWith('/text_to_speech')) {
        const audioUrl = await textToSpeech(message.text);
        await sendTelegramMessage(chatId, `Here is your audio: ${audioUrl}`);
    } else if (message.text.startsWith('/summarize')) {
        const summary = await summarizeText(message.text);
        await sendTelegramMessage(chatId, summary);
    } else if (message.text.startsWith('/generate_text')) {
        const generatedText = await generateText(message.text);
        await sendTelegramMessage(chatId, generatedText);
    } else if (message.text.startsWith('/image_to_text')) {
        const extractedText = await imageToText(message.photo);
        await sendTelegramMessage(chatId, extractedText);
    } else if (message.text.startsWith('/asr')) {
        const transcribedText = await automaticSpeechRecognition(message.voice);
        await sendTelegramMessage(chatId, transcribedText);
    } else if (message.text.startsWith('/detect_objects')) {
        const objects = await objectDetection(message.photo);
        await sendTelegramMessage(chatId, `Detected objects: ${objects}`);
    } else if (message.text.startsWith('/bin_check')) {
        const binInfo = await checkBIN(message.text.split(" ")[1]);
        await sendTelegramMessage(chatId, `BIN Info: ${binInfo}`);
    } else if (message.text.startsWith('/test_card')) {
        const testCard = generateTestCard();
        await sendTelegramMessage(chatId, `Test Card: ${testCard}`);
    } else if (message.text.startsWith('/random_user')) {
        const randomUser = await generateRandomUser();
        await sendTelegramMessage(chatId, `Random User: ${randomUser}`);
    } else if (message.text.startsWith('/yt_download')) {
        const videoUrl = await downloadYouTube(message.text.split(" ")[1]);
        await sendTelegramMessage(chatId, `Download link: ${videoUrl}`);
    } else if (message.text.startsWith('/ip_info')) {
        const ipInfo = await getIPInfo(message.text.split(" ")[1]);
        await sendTelegramMessage(chatId, `IP Info: ${ipInfo}`);
    } else if (message.text.startsWith('/broadcast')) {
        if (chatId === await ENV.ADMIN_CHAT_ID) {
            await broadcastMessage(message.text.replace('/broadcast ', ''));
            await sendTelegramMessage(chatId, 'Message broadcasted successfully.');
        } else {
            await sendTelegramMessage(chatId, 'You are not authorized to broadcast messages.');
        }
    } else {
        await sendTelegramMessage(chatId, 'I can help you with various AI tools and utilities. Use /cmds to see all available commands.');
    }
    return new Response('OK', { status: 200 });
}

async function sendTelegramMessage(chatId, text) {
    const token = await ENV.TELEGRAM_API_TOKEN;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text
        })
    });
}

async function generateAIImage(prompt) {
    const imageUrl = await fetch('https://api.cloudflare.com/workers-ai/image/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt
        })
    }).then(response => response.json()).then(data => data.url);
    return imageUrl;
}

async function chatWithAI(prompt) {
    const response = await fetch('https://api.cloudflare.com/workers-ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt
        })
    }).then(response => response.json()).then(data => data.response);
    return response;
}

async function textToSpeech(text) {
    const audioUrl = await fetch('https://api.cloudflare.com/workers-ai/text-to-speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text
        })
    }).then(response => response.json()).then(data => data.url);
    return audioUrl;
}

async function summarizeText(text) {
    const summary = await fetch('https://api.cloudflare.com/workers-ai/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            model: '@cf/facebook/bart-large-cnn'
        })
    }).then(response => response.json()).then(data => data.summary);
    return summary;
}

async function generateText(prompt) {
    const generatedText = await fetch('https://api.cloudflare.com/workers-ai/generate-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt
        })
    }).then(response => response.json()).then(data => data.text);
    return generatedText;
}

async function imageToText(image) {
    const extractedText = await fetch('https://api.cloudflare.com/workers-ai/image-to-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: image
        })
    }).then(response => response.json()).then(data => data.text);
    return extractedText;
}

async function automaticSpeechRecognition(voice) {
    const transcribedText = await fetch('https://api.cloudflare.com/workers-ai/automatic-speech-recognition', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            voice: voice
        })
    }).then(response => response.json()).then(data => data.text);
    return transcribedText;
}

async function objectDetection(image) {
    const objects = await fetch('https://api.cloudflare.com/workers-ai/object-detection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: image
        })
    }).then(response => response.json()).then(data => data.objects);
    return objects;
}

async function checkBIN(bin) {
    const binInfo = await fetch(`https://lookup.binlist.net/${bin}`, {
        method: 'GET',
        headers: {
            'Accept-Version': '3'
        }
    }).then(response => response.json());
    return JSON.stringify(binInfo);
}

function generateTestCard() {
    const cardNumber = '1234 5678 9012 3456';
    const expDate = '12/34';
    const cvv = '123';
    return `Card Number: ${cardNumber}, Exp: ${expDate}, CVV: ${cvv}`;
}

async function generateRandomUser() {
    const user = await fetch('https://randomuser.me/api/')
        .then(response => response.json())
        .then(data => data.results[0]);
    return `${user.name.first} ${user.name.last}, ${user.email}, ${user.location.city}, ${user.phone}`;
}

async function downloadYouTube(url) {
    // Note: Use a valid YouTube download API
    const downloadUrl = await fetch(`https://some-youtube-download-api.com/download?url=${url}`)
        .then(response => response.json())
        .then(data => data.download_link);
    return downloadUrl;
}

async function getIPInfo(ip) {
    const ipInfo = await fetch(`https://ipinfo.io/${ip}/json`, {
        method: 'GET',
    }).then(response => response.json());
    return JSON.stringify(ipInfo);
}

async function broadcastMessage(message) {
    const users = await D1.select(`SELECT chat_id FROM users`);
    for (const user of users) {
        await sendTelegramMessage(user.chat_id, message);
    }
}
