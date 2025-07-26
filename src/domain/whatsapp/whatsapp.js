// otpFeature.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ========== Infrastructure Layer ==========
const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

whatsappClient.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
  console.log('✅ WhatsApp is ready');
});

whatsappClient.initialize();

// ========== Domain Layer ==========
class Otp {
  constructor(phoneNumber, code) {
    this.phoneNumber = phoneNumber;
    this.code = code;
  }

  static isValid(inputOtp, storedOtp) {
    return inputOtp === storedOtp;
  }
}

// ========== Application Layer ==========
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(phoneNumber) {
  const otp = generateOtp();
  otpStore.set(phoneNumber, otp);
  setTimeout(() => otpStore.delete(phoneNumber), 5 * 60 * 1000); // Auto-expire in 5 min

  const message = `🛡️ Your OTP is: *${otp}*\n(Valid for 5 minutes)`;

  await whatsappClient.sendMessage(`${phoneNumber}@c.us`, message);
}

function verifyOtp(phoneNumber, otp) {
  const stored = otpStore.get(phoneNumber);
  if (!stored) return false;

  const isValid = Otp.isValid(otp, stored);
  if (isValid) otpStore.delete(phoneNumber);

  return isValid;
}

// ========== Export Handlers ==========
module.exports = {
  sendOtp,
  verifyOtp
};
