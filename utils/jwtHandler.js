const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH || path.join(__dirname, '..', 'keys', 'private.key');
const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.join(__dirname, '..', 'keys', 'public.key');

let cachedPrivateKey;
let cachedPublicKey;

function loadKey(filePath, keyType) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`${keyType} not found at ${filePath}. Please create RSA keys before using JWT RS256.`);
    }
}

function getPrivateKey() {
    if (!cachedPrivateKey) {
        cachedPrivateKey = loadKey(privateKeyPath, 'Private key');
    }
    return cachedPrivateKey;
}

function getPublicKey() {
    if (!cachedPublicKey) {
        cachedPublicKey = loadKey(publicKeyPath, 'Public key');
    }
    return cachedPublicKey;
}

module.exports = {
    signToken: function (payload, options = {}) {
        return jwt.sign(payload, getPrivateKey(), {
            algorithm: 'RS256',
            expiresIn: options.expiresIn || '30d'
        });
    },
    verifyToken: function (token) {
        return jwt.verify(token, getPublicKey(), {
            algorithms: ['RS256']
        });
    }
};
