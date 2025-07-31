const fs = require('fs');
const path = require('path');

class KeycloakKeys {
  constructor() {
    this.publicKey = null;
    this.loadPublicKey();
  }
  
  loadPublicKey() {
    try {
      const publicKeyPath = path.join(__dirname, '../../keycloak_public.pem');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log('Keycloak public key loaded successfully');
    } catch (error) {
      console.error('Failed to load Keycloak public key:', error.message);
      throw new Error('Keycloak public key is required for JWT verification');
    }
  }
  
  getPublicKey() {
    if (!this.publicKey) {
      throw new Error('Keycloak public key not loaded');
    }
    return this.publicKey;
  }
}

module.exports = new KeycloakKeys();
// Contains AI-generated edits.
