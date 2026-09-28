const fs = require('fs');
const path = require('path');

// Rebranding dictionary mapping
const BRAND_REPLACEMENTS = [
    { target: /Nextcloud/g, replacement: 'Kuro Drive' },
    { target: /nextcloud/g, replacement: 'kuro-drive' },
    { target: /NEXTCLOUD/g, replacement: 'KURO_DRIVE' },

    { target: /Mattermost/g, replacement: 'Kuro Chat' },
    { target: /mattermost/g, replacement: 'kuro-chat' },
    { target: /MATTERMOST/g, replacement: 'KURO_CHAT' },

    { target: /Jitsi Meet/g, replacement: 'Kuro Meet' },
    { target: /Jitsi/g, replacement: 'Kuro Meet' },
    { target: /jitsi/g, replacement: 'kuro-meet' },

    { target: /Stalwart Mail/g, replacement: 'Kuro Mail' },
    { target: /Stalwart/g, replacement: 'Kuro Mail' },
    { target: /stalwart/g, replacement: 'kuro-mail' },

    { target: /Twenty CRM/g, replacement: 'Kuro CRM' },
    { target: /Twenty/g, replacement: 'Kuro CRM' },
    { target: /twenty/g, replacement: 'kuro-crm' },

    { target: /Baserow/g, replacement: 'Kuro Data' },
    { target: /baserow/g, replacement: 'kuro-data' },

    { target: /Changedetection/g, replacement: 'KuroWatch' },
    { target: /changedetection/g, replacement: 'kurowatch' },

    { target: /Open WebUI/g, replacement: 'Abraham AI' },
    { target: /Open-WebUI/g, replacement: 'Abraham-AI' },
    { target: /open-webui/g, replacement: 'abraham-ai' },
    { target: /BitNet/g, replacement: 'Abraham AI' },

    { target: /Stirling-PDF/g, replacement: 'Kuro PDF' },
    { target: /StirlingPDF/g, replacement: 'Kuro PDF' },
    { target: /stirling-pdf/g, replacement: 'kuro-pdf' },

    { target: /LocalSend/g, replacement: 'Kuro Send' },
    { target: /localsend/g, replacement: 'kuro-send' },

    { target: /Draw\.io/g, replacement: 'Kuro Diagram' },
    { target: /draw\.io/g, replacement: 'kuro-diagram' },
    { target: /Drawio/g, replacement: 'Kuro Diagram' },

    { target: /Budibase/g, replacement: 'Kuro Apps' },
    { target: /budibase/g, replacement: 'kuro-apps' },

    { target: /Shotcut/g, replacement: 'Kuro Studio' },
    { target: /shotcut/g, replacement: 'kuro-studio' }
];

const LOGO_MAPPINGS = {
    'open-webui': 'Abraham AI.png',
    'stirling-pdf': 'kuro pdf.png',
    'localsend': 'kuro send.png',
    'drawio': 'kuro diagram.png',
    'nextcloud': 'kuro drive.png',
    'mattermost': 'kuro chat.png',
    'jitsi': 'meet.png',
    'twenty': 'kuro crm.png',
    'baserow': 'kuro data.png',
    'changedetection': 'soko watch.png',
    'budibase': 'kuro apps.png',
    'shotcut': 'kuro studio.png'
};

const LOGO_SOURCE_DIR = path.join(__dirname, 'rebrand dossier logo kuro');

// CSS Colors Injection
const KURO_BG_DARK = '#020617';
const KURO_PANEL_DARK = '#0F172A';

function processTextFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = content;

        BRAND_REPLACEMENTS.forEach(({ target, replacement }) => {
            modified = modified.replace(target, replacement);
        });

        // Simple color injection replacement for common primary/background hex codes
        modified = modified.replace(/#0f172a/gi, KURO_PANEL_DARK);
        modified = modified.replace(/#020617/gi, KURO_BG_DARK);

        if (modified !== content) {
            fs.writeFileSync(filePath, modified, 'utf8');
            console.log(`[Rebranded] ${filePath}`);
        }
    } catch (err) {
        // Skip binary or unreadable files
    }
}

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        if (item === '.git' || item === 'node_modules' || item === 'dist' || item === 'build') return;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.html', '.json', '.js', '.ts', '.jsx', '.tsx', '.vue', '.css', '.scss', '.md', '.env', '.example', '.xml', '.yml', '.yaml'].includes(ext) || item.startsWith('.env')) {
                processTextFile(fullPath);
            }
        }
    });
}

function copyLogosToProject(projectDir, projectKey) {
    const logoName = LOGO_MAPPINGS[projectKey];
    if (!logoName) return;

    const sourceLogoPath = path.join(LOGO_SOURCE_DIR, logoName);
    if (!fs.existsSync(sourceLogoPath)) return;

    // Search for existing logos / favicons to replace
    function replaceTargetLogos(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            if (item === '.git' || item === 'node_modules') return;
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                replaceTargetLogos(fullPath);
            } else if (stat.isFile()) {
                const lower = item.toLowerCase();
                if (lower.includes('logo') || lower.includes('favicon') || lower.includes('brand') || lower.includes('icon')) {
                    if (lower.endsWith('.png') || lower.endsWith('.ico') || lower.endsWith('.svg')) {
                        try {
                            fs.copyFileSync(sourceLogoPath, fullPath);
                            console.log(`[Logo Replaced] ${fullPath} <- ${logoName}`);
                        } catch (e) {}
                    }
                }
            }
        });
    }

    replaceTargetLogos(projectDir);
}

const args = process.argv.slice(2);
const targetProjectDir = args[0];
const projectKey = args[1];

if (targetProjectDir && fs.existsSync(targetProjectDir)) {
    console.log(`Starting rebranding for: ${targetProjectDir}`);
    processDirectory(targetProjectDir);
    if (projectKey) {
        copyLogosToProject(targetProjectDir, projectKey);
    }
    console.log(`Completed rebranding for: ${targetProjectDir}`);
} else {
    console.log("Usage: node rebrand.js <target_directory> [project_key]");
}
