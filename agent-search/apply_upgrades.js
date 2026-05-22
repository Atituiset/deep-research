const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'code_agent_evolution.html');
const scriptPath = path.join(__dirname, 'upgrade_systems.js');

if (!fs.existsSync(htmlPath)) {
    console.error('Error: code_agent_evolution.html not found!');
    process.exit(1);
}
if (!fs.existsSync(scriptPath)) {
    console.error('Error: upgrade_systems.js not found!');
    process.exit(1);
}

// 1. Read files and normalize line endings to LF (\n)
let html = fs.readFileSync(htmlPath, 'utf8').replace(/\r\n/g, '\n');
let scriptText = fs.readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');

// 2. Extract and evaluate upgradedShadowMergeEngine and upgradedGoalTreeManager variables
console.log('Extracting and compiling static code blocks from upgrade_systems.js...');

const startSmDecl = scriptText.indexOf('const upgradedShadowMergeEngine = `');
if (startSmDecl === -1) {
    console.error('Error: Could not locate upgradedShadowMergeEngine declaration in upgrade script!');
    process.exit(1);
}
const endSmDecl = scriptText.indexOf('</pre>`;', startSmDecl) + '</pre>`;'.length;
const smDecl = scriptText.substring(startSmDecl, endSmDecl);
let upgradedShadowMergeEngine;
eval(smDecl);

const startGtDecl = scriptText.indexOf('const upgradedGoalTreeManager = `');
if (startGtDecl === -1) {
    console.error('Error: Could not locate upgradedGoalTreeManager declaration in upgrade script!');
    process.exit(1);
}
const endGtDecl = scriptText.indexOf('</pre>`;', startGtDecl) + '</pre>`;'.length;
const gtDecl = scriptText.substring(startGtDecl, endGtDecl);
let upgradedGoalTreeManager;
eval(gtDecl);

console.log('✓ Successfully compiled static code blocks.');

// 3. Replace ShadowMergeEngine section in HTML
console.log('Replacing ShadowMergeEngine section in HTML...');
const startSm = html.indexOf('<pre>\n<span class="syntax-keyword">interface</span> <span class="syntax-type">EditPatch</span> {');
const endSmSearch = '\n</pre>\n                        </div>\n                    </div>\n\n                    <!-- Goal Trees 多叉树回溯算法 -->';
const endSm = html.indexOf(endSmSearch);

if (startSm !== -1 && endSm !== -1) {
    const endOffset = endSm + '\n</pre>'.length;
    const targetString = html.substring(startSm, endOffset);
    html = html.replace(targetString, upgradedShadowMergeEngine);
    console.log('✓ ShadowMergeEngine replaced successfully.');
} else {
    console.error(`✗ ShadowMergeEngine boundary indices not found! start=${startSm}, end=${endSm}`);
    process.exit(1);
}

// 4. Replace GoalTreeManager section in HTML
console.log('Replacing GoalTreeManager section in HTML...');
const startGt = html.indexOf('<pre>\n<span class="syntax-keyword">enum</span> <span class="syntax-type">GoalStatus</span> {');
const endGtSearch = '\n</pre>\n                        </div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- 第五部分：终极对比矩阵 -->';
const endGt = html.indexOf(endGtSearch);

if (startGt !== -1 && endGt !== -1) {
    const endOffset = endGt + '\n</pre>'.length;
    const targetString = html.substring(startGt, endOffset);
    html = html.replace(targetString, upgradedGoalTreeManager);
    console.log('✓ GoalTreeManager replaced successfully.');
} else {
    console.error(`✗ GoalTreeManager boundary indices not found! start=${startGt}, end=${endGt}`);
    process.exit(1);
}

// 5. Extract raw systemsTechDetails string from scriptText without compiling it (to preserve backslash escapes)
console.log('Extracting raw techDetails object to preserve backslash escapes...');
const startTechDecl = scriptText.indexOf('const systemsTechDetails = `');
if (startTechDecl === -1) {
    console.error('Error: Could not locate systemsTechDetails in upgrade script!');
    process.exit(1);
}
const startTechContent = startTechDecl + 'const systemsTechDetails = `'.length;
const endTechDecl = scriptText.indexOf('const targetPart = html.substring', startTechContent);
if (endTechDecl === -1) {
    console.error('Error: Could not locate closing boundary of systemsTechDetails!');
    process.exit(1);
}

// Find the last occurrence of '};' before the end boundary
const lastBraceIdx = scriptText.lastIndexOf('};', endTechDecl);
let rawTechDetails = scriptText.substring(startTechContent, lastBraceIdx + '};'.length);

// Fix the outer backticks (opening and closing) of the template literals:
// 1. Remove the backslash before the opening backtick of content: `
rawTechDetails = rawTechDetails.replace(/content:\s*\\`/g, 'content: `');
// 2. Remove the backslash before the closing backtick of content (only when on its own line): `
rawTechDetails = rawTechDetails.replace(/\n\s*\\`\n/g, (match) => match.replace('\\`', '`'));

console.log('✓ Raw techDetails object successfully extracted and escaping adjusted.');

// 6. Replace techDetails object in HTML
console.log('Replacing techDetails data object in HTML...');
const startTechDetailsIdx = html.indexOf('const techDetails = {');
const endTechDetailsIdx = html.indexOf('// 打开抽屉\n        function openDrawer(techKey) {');

if (startTechDetailsIdx !== -1 && endTechDetailsIdx !== -1) {
    const targetPart = html.substring(startTechDetailsIdx, endTechDetailsIdx);
    html = html.replace(targetPart, rawTechDetails + '\n\n        ');
    console.log('✓ Replaced techDetails object successfully.');
} else {
    console.error(`✗ techDetails indices not found in HTML! start=${startTechDetailsIdx}, end=${endTechDetailsIdx}`);
    process.exit(1);
}

// 7. Upgrade headers, navigation, and descriptions in HTML body for absolute systems engineering rigour
console.log('Upgrading headers and terminology in HTML body...');
html = html.replace('<h2 class="section-title">工具演进里程碑与数学范式退化分析</h2>', '<h2 class="section-title">1.0 Architectural Evolution & POMDP State Formulations</h2>');
html = html.replace('<h2 class="section-title">核心技术深潜规格</h2>', '<h2 class="section-title">2.0 Core Subsystem Technical Specifications (RFC-409 Deep Dive)</h2>');
html = html.replace('<h2 class="section-title">Agent 物理自愈闭环调试模拟器</h2>', '<h2 class="section-title">3.0 Self-Healing Operations & Execution Trace Verification</h2>');
html = html.replace('<h2 class="section-title">顶级 Code Agent 的工业工程落地实践</h2>', '<h2 class="section-title">4.0 Industrial Deployments & Systems Engineering Deep Dive</h2>');
html = html.replace('<h2 class="section-title">核心设计模式与底层系统工程还原</h2>', '<h2 class="section-title">5.0 Reference Implementations & Mathematical Models</h2>');
html = html.replace('<h2 class="section-title">Code Agent 核心引擎技术参数横向对比矩阵</h2>', '<h2 class="section-title">6.0 System Design Parameters & Architectural Matrix</h2>');

// Navigation titles
html = html.replace('💡 背景与范式变革', '💡 Background Context & Paradigm shift');
html = html.replace('⏳ 演进史里程碑', '⏳ 1.0 Evolutionary Trajectory');
html = html.replace('🧠 核心技术深潜', '🧠 2.0 Subsystem Specifications');
html = html.replace('🔄 执行流自愈模拟', '🔄 3.0 Operations Simulator');
html = html.replace('🏢 头部厂商实践', '🏢 4.0 Industrial Deployments');
html = html.replace('⚙️ 核心模式工程还原', '⚙️ 5.0 Reference Algorithms');
html = html.replace('📊 终极对比矩阵', '📊 6.0 Architectural Benchmarks');

// Save the upgraded HTML file
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('★ All system upgrades applied successfully to code_agent_evolution.html! ★');
