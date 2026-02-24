/**
 * Bug Condition Exploration Test - Backend Crash Missing Axios
 * 
 * **Validates: Requirements 1.1, 2.1**
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists.
 * 
 * Bug Condition: Backend crashes when starting without axios installed
 * Expected Behavior: Backend should start successfully with axios available
 * 
 * This test verifies:
 * 1. Backend crashes when axios is not in package.json
 * 2. Error message contains "Cannot find module 'axios'"
 * 3. Error occurs when loading mercadoPagoService.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Bug Condition Exploration: Backend Crash Without Axios', () => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const mercadoPagoServicePath = path.join(__dirname, '../services/mercadoPagoService.js');

    test('Property 1: Fault Condition - Backend crashes without axios in package.json', () => {
        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Verify axios is NOT in dependencies (this is the bug condition)
        const axiosInDependencies = packageJson.dependencies && packageJson.dependencies.axios;
        
        // Check if axios exists in node_modules
        const axiosModulePath = path.join(__dirname, '../../node_modules/axios');
        const axiosExists = fs.existsSync(axiosModulePath);
        
        console.log('Bug Condition Check:');
        console.log('- axios in package.json dependencies:', axiosInDependencies ? 'YES' : 'NO');
        console.log('- axios in node_modules:', axiosExists ? 'YES' : 'NO');
        
        // If axios is not in package.json, attempting to require mercadoPagoService should fail
        if (!axiosInDependencies) {
            console.log('\nAttempting to load mercadoPagoService without axios in package.json...');
            
            try {
                // Clear require cache to force fresh load
                delete require.cache[require.resolve(mercadoPagoServicePath)];
                
                // This should throw an error if axios is not installed
                require(mercadoPagoServicePath);
                
                // If we reach here, the bug is NOT present (axios was somehow available)
                // This means the test should FAIL because we expected the bug to exist
                throw new Error('UNEXPECTED: mercadoPagoService loaded successfully without axios in package.json. Bug may not exist or axios was installed manually.');
            } catch (error) {
                // Expected error: Cannot find module 'axios'
                console.log('\nCaught expected error:', error.message);
                
                // Verify the error is about missing axios
                const isAxiosError = error.message.includes("Cannot find module 'axios'");
                const isMercadoPagoError = error.stack && error.stack.includes('mercadoPagoService');
                
                console.log('- Error mentions axios:', isAxiosError ? 'YES' : 'NO');
                console.log('- Error originates from mercadoPagoService:', isMercadoPagoError ? 'YES' : 'NO');
                
                // This test EXPECTS to find the bug
                // When the bug exists, we should get the axios error
                // The test "passes" by documenting the bug exists
                expect(isAxiosError).toBe(true);
                expect(error.message).toContain("Cannot find module 'axios'");
                
                // Document the counterexample
                console.log('\n=== COUNTEREXAMPLE FOUND ===');
                console.log('Bug Condition: Backend crashes when starting without axios');
                console.log('Error Message:', error.message);
                console.log('Stack Trace:', error.stack);
                console.log('===========================\n');
                
                // The bug is confirmed - this is the EXPECTED outcome for exploration
                // We throw to make the test FAIL, proving the bug exists
                throw new Error(`BUG CONFIRMED: ${error.message}`);
            }
        } else {
            // axios IS in package.json - the bug has already been fixed
            console.log('\naxios found in package.json - bug appears to be already fixed');
            
            // Try to load the service - it should work
            try {
                delete require.cache[require.resolve(mercadoPagoServicePath)];
                const service = require(mercadoPagoServicePath);
                console.log('mercadoPagoService loaded successfully');
                
                // Test passes - expected behavior is satisfied
                expect(service).toBeDefined();
            } catch (error) {
                // Unexpected error - axios is in package.json but still failing
                console.error('Unexpected error even with axios in package.json:', error.message);
                throw error;
            }
        }
    });

    test('Property 1 Alternative: Verify package.json missing axios dependency', () => {
        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check if axios is in dependencies
        const hasAxios = packageJson.dependencies && packageJson.dependencies.axios;
        
        console.log('\nPackage.json Dependency Check:');
        console.log('Current dependencies:', Object.keys(packageJson.dependencies || {}).join(', '));
        console.log('axios present:', hasAxios ? 'YES' : 'NO');
        
        // For exploration, we expect axios to be MISSING (the bug condition)
        // When axios is missing, this test should FAIL to document the bug
        if (!hasAxios) {
            console.log('\n=== BUG CONDITION CONFIRMED ===');
            console.log('axios is NOT listed in package.json dependencies');
            console.log('This will cause backend to crash when mercadoPagoService is loaded');
            console.log('================================\n');
            
            // Fail the test to document the bug exists
            expect(hasAxios).toBe(true); // This will FAIL, proving the bug
        } else {
            // axios is present - expected behavior
            console.log('\nExpected behavior: axios is in package.json');
            expect(hasAxios).toBe(true); // This will PASS
        }
    });
});
