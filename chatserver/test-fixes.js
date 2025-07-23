// test-fixes.js - Run this to test the fixes

console.log('🧪 === TESTING FIXES ===\n');

// Test 1: Check isAuth import
try {
  console.log('🔐 Testing isAuth middleware import...');
  const authModule = await import('./middlewares/isAuth.js');
  const isAuth = authModule.default;
  
  if (typeof isAuth === 'function') {
    console.log('✅ isAuth imported successfully as default export');
  } else {
    console.log('❌ isAuth is not a function:', typeof isAuth);
  }
} catch (error) {
  console.log('❌ isAuth import failed:', error.message);
}

// Test 2: Check character routes import
try {
  console.log('🎭 Testing character routes import...');
  const routesModule = await import('./routes/characterRoutes.js');
  const router = routesModule.default;
  
  if (typeof router === 'function') {
    console.log('✅ Character routes imported successfully');
  } else {
    console.log('❌ Character routes is not a router:', typeof router);
  }
} catch (error) {
  console.log('❌ Character routes import failed:', error.message);
  console.log('Error details:', error.stack);
}

// Test 3: Check character controllers import
try {
  console.log('🎛️ Testing character controllers import...');
  const controllers = await import('./controllers/characterControllers.js');
  
  const requiredFunctions = ['getAllCharacters', 'createCharacter', 'getCharacterOptions'];
  let allPresent = true;
  
  for (const func of requiredFunctions) {
    if (typeof controllers[func] === 'function') {
      console.log(`✅ ${func} - Available`);
    } else {
      console.log(`❌ ${func} - Missing or not a function`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✅ All character controllers available');
  }
} catch (error) {
  console.log('❌ Character controllers import failed:', error.message);
}

console.log('\n🎯 === TEST COMPLETE ===');
console.log('If all tests passed, restart your server with: npm start');
console.log('Then test: http://localhost:5000/api/characters/test');