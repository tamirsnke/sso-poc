#!/usr/bin/env node

/**
 * Migration script to verify the new folder structure is working correctly
 * This script checks that all the new files are in place and the old structure can be safely removed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying new folder structure...\n');

const requiredFiles = {
  'node-api-1': [
    'server.js',
    'src/config/index.js',
    'src/config/keycloak.js',
    'src/controllers/authController.js',
    'src/controllers/healthController.js',
    'src/controllers/microservicesController.js',
    'src/middleware/auth.js',
    'src/middleware/common.js',
    'src/middleware/cors.js',
    'src/middleware/security.js',
    'src/middleware/session.js',
    'src/routes/auth.js',
    'src/routes/health.js',
    'src/routes/microservices.js',
    'src/routes/index.js',
    'src/services/authService.js',
    'src/services/tokenService.js',
    'src/utils/helpers.js',
    'src/utils/logger.js'
  ],
  'node-api-2': [
    'server.js',
    'src/config/index.js',
    'src/controllers/businessController.js',
    'src/controllers/healthController.js',
    'src/middleware/auth.js',
    'src/routes/business.js',
    'src/routes/health.js',
    'src/routes/index.js',
    'src/services/authService.js'
  ]
};

let allGood = true;

for (const [service, files] of Object.entries(requiredFiles)) {
  console.log(`📁 Checking ${service}:`);
  
  for (const file of files) {
    const fullPath = path.join(__dirname, 'apis', service, file);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - MISSING`);
      allGood = false;
    }
  }
  console.log('');
}

// Check package.json updates
const apis = ['node-api-1', 'node-api-2'];
for (const api of apis) {
  const packagePath = path.join(__dirname, 'apis', api, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.main === 'server.js') {
      console.log(`✅ ${api}/package.json - main field updated to server.js`);
    } else {
      console.log(`❌ ${api}/package.json - main field not updated (${packageJson.main})`);
      allGood = false;
    }
  }
}

console.log('\n📊 Migration Status:');
if (allGood) {
  console.log('✅ All required files are in place!');
  console.log('✅ Package.json files are updated correctly!');
  console.log('\n🚀 You can now:');
  console.log('1. Test the new structure: npm start in each API directory');
  console.log('2. Verify all endpoints work correctly');
  console.log('3. Remove the old index.js files when ready');
  console.log('\n🗑️  To remove legacy files:');
  console.log('   rm apis/node-api-1/index.js');
  console.log('   rm apis/node-api-2/index.js');
} else {
  console.log('❌ Some files are missing. Please check the file structure.');
  console.log('📖 Refer to REFACTORING.md for the complete structure.');
}

console.log('\n📚 Documentation: See REFACTORING.md for detailed information');
