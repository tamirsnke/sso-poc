#!/usr/bin/env node
/**
 * HTTPS Certificate Generator for Development
 * Consolidated script for generating self-signed certificates
 * Supports both npm selfsigned package and fallback to OpenSSL
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Setting up HTTPS certificates for development (Node.js method)...\n');

const certsDir = path.join(__dirname, 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
  console.log('📁 Created certs directory');
}

try {
  // Try to use selfsigned package
  const selfsigned = require('selfsigned');
  
  console.log('🔑 Generating self-signed certificate...');
  
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'Development' },
    { name: 'localityName', value: 'Localhost' },
    { name: 'organizationName', value: 'SSO Development' },
    { name: 'organizationalUnitName', value: 'IT Department' }
  ];
  
  const options = {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: false
      },
      {
        name: 'keyUsage',
        keyCertSign: false,
        digitalSignature: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: false
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 2, value: '*.localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' }
        ]
      }
    ]
  };
  
  const pems = selfsigned.generate(attrs, options);
  
  // Write certificate files
  fs.writeFileSync(path.join(certsDir, 'localhost.key'), pems.private);
  fs.writeFileSync(path.join(certsDir, 'localhost.crt'), pems.cert);
  fs.writeFileSync(path.join(certsDir, 'localhost.pem'), pems.cert + pems.private);
  
  console.log('\n✅ HTTPS certificates generated successfully!');
  console.log('\n📋 Generated files:');
  console.log(`   🔑 Private Key: ${path.join(certsDir, 'localhost.key')}`);
  console.log(`   📜 Certificate: ${path.join(certsDir, 'localhost.crt')}`);
  console.log(`   🔗 Combined PEM: ${path.join(certsDir, 'localhost.pem')}`);
  
  console.log('\n⚠️  To trust the certificate in your browser:');
  console.log('   1. Open your browser and navigate to https://localhost:3443');
  console.log('   2. Click "Advanced" -> "Proceed to localhost (unsafe)"');
  console.log('   3. Or add certificate to trusted store (Windows):');
  console.log('      - Double-click localhost.crt');
  console.log('      - Click "Install Certificate"');
  console.log('      - Choose "Local Machine" -> "Trusted Root Certification Authorities"');
  
  console.log('\n🚀 Your services will now support HTTPS in development!');
  console.log('   📍 Auth Service HTTPS: https://localhost:3443');
  console.log('   📍 Business Service HTTPS: https://localhost:3444');
  
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('📦 Installing selfsigned package...');
    const { execSync } = require('child_process');
    execSync('npm install selfsigned', { stdio: 'inherit' });
    console.log('✅ Package installed. Please run this script again.');
  } else {
    console.error('❌ Error generating certificates:', error.message);
    process.exit(1);
  }
}
