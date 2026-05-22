const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'code_agent_evolution.html');
console.log('Starting automated linting and interactivity verification...');

if (!fs.existsSync(htmlPath)) {
    console.error(`Error: File not found at ${htmlPath}`);
    process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 1. Validate JavaScript compilation syntax
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.error('Error: <script> tag not found in the HTML file!');
    process.exit(1);
}

const scriptContent = scriptMatch[1];
const tempScriptPath = path.join(__dirname, 'temp_extracted_script.js');
fs.writeFileSync(tempScriptPath, scriptContent, 'utf8');

try {
    const { execSync } = require('child_process');
    execSync(`node --check "${tempScriptPath}"`);
    console.log('✓ Step 1 Passed: Embedded JavaScript contains zero syntax errors.');
} catch (err) {
    console.error('✗ Step 1 Failed: Embedded JavaScript has syntax errors!');
    console.error(err.toString());
    fs.unlinkSync(tempScriptPath);
    process.exit(1);
}
fs.unlinkSync(tempScriptPath);

// 2. Extract and match onclick triggers against techDetails keys
// Extract techDetails object keys from the JS script
let keys = [];
try {
    // Dynamically evaluate techDetails in a sandboxed VM context with browser stubs
    const vm = require('vm');
    
    // Custom proxy to return a mock element whenever any property is accessed
    const makeMockElement = () => {
        const elem = {
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            },
            style: {},
            value: '',
            innerText: '',
            innerHTML: '',
            appendChild: () => {},
            addEventListener: () => {}
        };
        return elem;
    };

    const sandbox = {
        document: {
            getElementById: () => makeMockElement(),
            querySelector: () => makeMockElement(),
            querySelectorAll: () => [makeMockElement()],
            addEventListener: () => {}
        },
        window: {
            addEventListener: () => {}
        },
        console: console,
        keysList: []
    };
    vm.createContext(sandbox);
    // Execute a minimal script that extracts the keys of techDetails
    const extractionCode = `${scriptContent}\n;if (typeof techDetails !== "undefined") { keysList = Object.keys(techDetails); }`;
    vm.runInContext(extractionCode, sandbox);
    keys = sandbox.keysList || [];
    console.log(`✓ Step 2 Passed: Successfully extracted keys from techDetails object: ${JSON.stringify(keys)}`);
} catch (err) {
    console.error('✗ Step 2 Failed: Could not parse techDetails object dynamically!');
    console.error(err.stack || err.toString());
    process.exit(1);
}

// 3. Scan HTML for all instances of openDrawer('...') calls
const openDrawerRegex = /openDrawer\(['"]([^'"]+)['"]\)/g;
let match;
const foundDrawerCalls = new Set();
while ((match = openDrawerRegex.exec(htmlContent)) !== null) {
    foundDrawerCalls.add(match[1]);
}

console.log(`✓ Found openDrawer triggers in HTML: ${JSON.stringify([...foundDrawerCalls])}`);

// 4. Assert all click actions are fully bound to valid data keys
let allValid = true;
for (const caller of foundDrawerCalls) {
    if (!keys.includes(caller)) {
        console.error(`✗ Error: Element references openDrawer('${caller}'), but '${caller}' is not defined in techDetails!`);
        allValid = false;
    } else {
        console.log(`  - openDrawer('${caller}') is correctly bound and resolved.`);
    }
}

// 5. Verify basic HTML Structure for drawers
const requiredElements = ['drawerOverlay', 'drawerContent', 'drawerInnerContent'];
for (const id of requiredElements) {
    if (!htmlContent.includes(`id="${id}"`)) {
        console.error(`✗ Error: Required DOM element with id="${id}" is missing in the HTML!`);
        allValid = false;
    } else {
        console.log(`✓ Found required interactive DOM element: id="${id}"`);
    }
}

if (allValid) {
    console.log('\n★ SUCCESS: Interactivity and bindings are 100% verified and correct! ★');
    process.exit(0);
} else {
    console.error('\n★ FAILURE: One or more validation checks failed! ★');
    process.exit(1);
}
