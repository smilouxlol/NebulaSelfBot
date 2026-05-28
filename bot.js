require('dotenv').config();
const { Client, RichPresence } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PREFIX = '.';
const client = new Client();
let config = { statusInterval: 10, avatarInterval: 15 };
const TOKEN = process.env.DISCORD_TOKEN;

if (fs.existsSync('config.json')) {
    try { config = { ...config, ...JSON.parse(fs.readFileSync('config.json', 'utf-8')) }; } catch (e) {}
}

let statusList = [];
let statusRotatorActive = false;
let statusRotatorInterval = null;
let currentStatusIndex = 0;

function loadStatus() {
    try {
        if (fs.existsSync('text.txt')) {
            const raw = fs.readFileSync('text.txt', 'utf-8').split('\n').map(l => l.trim());
            statusList = raw.filter(l => l.length > 0);
            if (statusList.length === 0) statusList = ['Nebula Selfbot'];
        } else statusList = ['Nebula Selfbot'];
    } catch (e) { statusList = ['Nebula Selfbot']; }
}

function saveStatus() {
    fs.writeFileSync('text.txt', statusList.join('\n'), 'utf-8');
}

function changeCustomStatus(token, text) {
    const data = JSON.stringify({ custom_status: { text: text } });
    const options = {
        hostname: 'discord.com',
        port: 443,
        path: '/api/v10/users/@me/settings',
        method: 'PATCH',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    const req = https.request(options);
    req.on('error', () => {});
    req.write(data);
    req.end();
}

function startStatusRotator() {
    if (statusRotatorActive) return false;
    statusRotatorActive = true;
    currentStatusIndex = 0;
    
    const rotateStatus = () => {
        if (!statusRotatorActive || statusList.length === 0) return;
        const current = statusList[currentStatusIndex];
        try { 
            changeCustomStatus(TOKEN, current);
            console.log(`\x1b[35m┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
            console.log(`\x1b[35m┃\x1b[0m \x1b[1;35m[ NEBULA ROTATOR ]\x1b[0m`);
            console.log(`\x1b[35m┃\x1b[0m \x1b[37mHora   : ${formatTime()}\x1b[0m`);
            console.log(`\x1b[35m┃\x1b[0m \x1b[37mAcción : Actualización de estado\x1b[0m`);
            console.log(`\x1b[35m┃\x1b[0m \x1b[37mActual : \x1b[1;37m${current}\x1b[0m`);
            console.log(`\x1b[35m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n`);
        } catch (e) {}
        currentStatusIndex = (currentStatusIndex + 1) % statusList.length;
    };
    
    rotateStatus();
    statusRotatorInterval = setInterval(rotateStatus, config.statusInterval * 1000);
    return true;
}

function stopStatusRotator() {
    if (!statusRotatorActive) return false;
    statusRotatorActive = false;
    if (statusRotatorInterval) clearInterval(statusRotatorInterval);
    return true;
}

let avatarRotatorActive = false;
let avatarRotatorInterval = null;
let avatarFiles = [];
const AVATARS_DIR = path.join(__dirname, 'avatars');

function loadAvatars() {
    try {
        if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR);
        avatarFiles = fs.readdirSync(AVATARS_DIR).filter(f => ['.gif', '.jpeg', '.jpg', '.png', '.webp'].includes(path.extname(f).toLowerCase())).map(f => path.join(AVATARS_DIR, f));
        return avatarFiles.length;
    } catch (e) { return 0; }
}

function startAvatarRotator() {
    if (avatarRotatorActive) return { success: false };
    loadAvatars();
    if (avatarFiles.length === 0) return { success: false };
    avatarRotatorActive = true;
    const rotateAvatar = async () => {
        if (!avatarRotatorActive || avatarFiles.length === 0) return;
        try { await client.user.setAvatar(fs.readFileSync(avatarFiles[Math.floor(Math.random() * avatarFiles.length)])); } catch (e) {}
    };
    rotateAvatar();
    avatarRotatorInterval = setInterval(rotateAvatar, config.avatarInterval * 60 * 1000);
    return { success: true };
}

function stopAvatarRotator() {
    if (!avatarRotatorActive) return false;
    avatarRotatorActive = false;
    if (avatarRotatorInterval) clearInterval(avatarRotatorInterval);
    return true;
}

function formatTime() {
    return new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

const formatMsg = (text) => `\`\`\`ansi\n\u001b[1;35m${text}\u001b[0m\n\`\`\``;

const editAndDelete = async (msg, text, time = 10000) => {
    try {
        await msg.edit(text);
        setTimeout(() => msg.delete().catch(() => {}), time);
    } catch (e) {}
};

client.on('ready', async () => {
    console.clear();
    const magenta = '\x1b[35m', boldMagenta = '\x1b[1;35m', cyan = '\x1b[36m', white = '\x1b[37m', reset = '\x1b[0m';
    
    console.log(`
    ${boldMagenta}███╗   ██╗███████╗██████╗ ██╗   ██╗██╗      █████╗ ${reset}
    ${boldMagenta}████╗  ██║██╔════╝██╔══██╗██║   ██║██║     ██╔══██╗${reset}
    ${magenta}██╔██╗ ██║█████╗  ██████╔╝██║   ██║██║     ███████║${reset}
    ${magenta}██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║██║     ██╔══██║${reset}
    ${magenta}██║ ╚████║███████╗██████╔╝╚██████╔╝███████╗██║  ██║${reset}
    ${magenta}╚═╝  ╚═══╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝${reset}
    `);
    console.log(`${cyan}════════════════════════════════════════════════════════${reset}`);
    console.log(`${boldMagenta} [ NEBULA ]${reset} Sesión activa: ${white}${client.user.tag}${reset}`);
    console.log(`${cyan}════════════════════════════════════════════════════════${reset}\n`);

    loadStatus();
    loadAvatars();

    const r = new RichPresence(client)
        .setApplicationId('TU_APP_ID_AQUI')
        .setType('STREAMING')
        .setURL('https://www.twitch.tv/tu_canal')
        .setState('Tu estado aquí')
        .setName('Nombre del juego/actividad')
        .setDetails('Detalles aquí')
        .setAssetsLargeImage('URL_IMAGEN_GRANDE') 
        .setAssetsSmallImage('URL_IMAGEN_PEQUEÑA')
        .setAssetsSmallText('Texto pequeño')
        .setStartTimestamp(Date.now())
        .addButton('Botón 1', 'https://discord.com')
        .addButton('Botón 2', 'https://discord.com');

    client.user.setActivity(r);
});

client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'help') {
        await editAndDelete(message, `\`\`\`ansi
\u001b[1;35m═══════════════ NEBULA SELFBOT ═══════════════\u001b[0m
\u001b[1;35m[ Comandos Básicos ]\u001b[0m
\u001b[0;35mhelp\u001b[0m / \u001b[0;35mping\u001b[0m / \u001b[0;35mpurge <N>\u001b[0m / \u001b[0;35msetnick <N>\u001b[0m
\u001b[1;35m[ Status Rotator ]\u001b[0m
\u001b[0;35mroton\u001b[0m / \u001b[0;35mrotoff\u001b[0m / \u001b[0;35mrotstatus\u001b[0m / \u001b[0;35mrotadd <txt>\u001b[0m
\u001b[1;35m[ Avatar Rotator ]\u001b[0m
\u001b[0;35mavaton\u001b[0m / \u001b[0;35mavatoff\u001b[0m / \u001b[0;35mavatlist\u001b[0m
\u001b[1;35m══════════════════════════════════════════════\u001b[0m
\`\`\``);
    }
    else if (command === 'ping') await editAndDelete(message, formatMsg(`Pong! Latencia: ${Date.now() - message.createdTimestamp}ms`));
    else if (command === 'purge') {
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100) return editAndDelete(message, formatMsg('Especifica un número entre 1 y 100.'));
        try {
            const msgs = await message.channel.messages.fetch({ limit: 100 });
            const myMsgs = Array.from(msgs.filter(m => m.author.id === client.user.id).values());
            let deleted = 0;
            for (const msg of myMsgs) {
                if (deleted >= amount) break;
                await msg.delete().catch(() => {});
                deleted++;
                await new Promise(r => setTimeout(r, 1200)); 
            }
            const reply = await message.channel.send(formatMsg(`Purge completado: ${deleted} mensajes borrados.`));
            setTimeout(() => reply.delete().catch(() => {}), 10000);
        } catch (e) { await editAndDelete(message, formatMsg(`Error en purge`)); }
    }
    else if (command === 'roton') await editAndDelete(message, formatMsg(startStatusRotator() ? `Rotador iniciado` : 'Ya estaba activo'));
    else if (command === 'rotoff') await editAndDelete(message, formatMsg(stopStatusRotator() ? 'Rotador detenido' : 'No estaba activo'));
    else if (command === 'rotadd') {
        const newStatus = args.join(' ');
        if (!newStatus) return editAndDelete(message, formatMsg('Escribe un estado.'));
        statusList.push(newStatus);
        saveStatus();
        await editAndDelete(message, formatMsg(`Estado añadido.`));
    }
    else if (command === 'avaton') await editAndDelete(message, formatMsg(startAvatarRotator().success ? 'Avatar Rotator iniciado' : 'Error al iniciar'));
    else if (command === 'avatoff') await editAndDelete(message, formatMsg(stopAvatarRotator() ? 'Avatar Rotator detenido' : 'No estaba activo'));
});

if (TOKEN) client.login(TOKEN).catch(() => process.exit(1));
