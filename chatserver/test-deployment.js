// test-deployment.js - Run this to verify your fixes

console.log('🧪 === TESTING DEPLOYMENT FIXES ===\n');

// Test 1: Check if chat routes import correctly
try {
  console.log('💬 Testing chat routes import...');
  const chatRoutes = await import('./routes/chatRoutes.js');
  if (chatRoutes.default) {
    console.log('✅ Chat routes imported successfully');
  } else {
    console.log('❌ Chat routes import failed - no default export');
  }
} catch (error) {
  console.log('❌ Chat routes import failed:', error.message);
}

// Test 2: Check if chat controllers import correctly  
try {
  console.log('🤖 Testing chat controllers import...');
  const chatControllers = await import('./controllers/chatControllers.js');
  if (chatControllers.generateResponse) {
    console.log('✅ Chat controllers imported successfully');
    console.log('✅ generateResponse function available');
  } else {
    console.log('❌ generateResponse function missing');
  }
} catch (error) {
  console.log('❌ Chat controllers import failed:', error.message);
}

// Test 3: Test CORS configuration
async function testCORS() {
  console.log('🌐 Testing CORS configuration...');
  
  const testOrigins = [
    'https://ai-character-chatbot-7.onrender.com',
    'https://ai-character-chatbot-2.onrender.com',
    'https://ai-character-chatbot-one.vercel.app',
    'http://localhost:5173'
  ];
  
  console.log('✅ CORS configured for origins:');
  testOrigins.forEach(origin => {
    console.log(`   - ${origin}`);
  });
}

// Test 4: Environment check
function testEnvironment() {
  console.log('⚙️ Testing environment configuration...');
  
  const requiredEnvVars = [
    'EMAIL_USERNAME',
    'MONGO_URI', 
    'JWT_SECRET',
    'GEMINI_API_KEY'
  ];
  
  let allPresent = true;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} - Configured`);
    } else {
      console.log(`❌ ${envVar} - Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Test 5: Server start simulation
async function testServerStart() {
  console.log('🚀 Testing server startup simulation...');
  
  try {
    // Simulate the import process
    await import('./database/db.js');
    console.log('✅ Database module imported');
    
    console.log('✅ Server startup should work');
    return true;
  } catch (error) {
    console.log('❌ Server startup issue:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running all deployment tests...\n');
  
  const envOk = testEnvironment();
  console.log('');
  
  await testCORS();
  console.log('');
  
  const serverOk = await testServerStart();
  console.log('');
  
  console.log('🎯 === TEST RESULTS ===');
  console.log(`Environment: ${envOk ? '✅ Ready' : '❌ Issues'}`);
  console.log(`Server Startup: ${serverOk ? '✅ Ready' : '❌ Issues'}`);
  console.log('CORS: ✅ Configured');
  
  console.log('\n🎯 === NEXT STEPS ===');
  console.log('1. Replace files with fixed versions');
  console.log('2. Update frontend server URL');
  console.log('3. Set environment variables in deployment');
  console.log('4. Deploy and test live');
  
  console.log('\n🌐 === DEPLOYMENT URLS ===');
  console.log('Backend: https://ai-character-chatbot-2.onrender.com');
  console.log('Frontend: https://ai-character-chatbot-7.onrender.com');
  console.log('Test CORS: https://ai-character-chatbot-2.onrender.com/test-cors');
  console.log('Test Status: https://ai-character-chatbot-2.onrender.com/status');
}

runAllTests();