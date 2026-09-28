const fs = require('fs');
const path = require('path');

const OFFICE_REPLACEMENTS = [
    { target: /ONLYOFFICE Desktop Editors/g, replacement: 'Kuro Office' },
    { target: /ONLYOFFICE/g, replacement: 'Kuro Office' },
    { target: /OnlyOffice/g, replacement: 'Kuro Office' },
    { target: /onlyoffice/g, replacement: 'kuro-office' },
    
    // Modules names
    { target: /Document Editor/g, replacement: 'Kuro Docs' },
    { target: /Spreadsheet Editor/g, replacement: 'Kuro Sheets' },
    { target: /Presentation Editor/g, replacement: 'Kuro Slides' },
    { target: /PDF Viewer/g, replacement: 'Kuro Reader' },
    { target: /Form Creator/g, replacement: 'Kuro Forms' }
];

const LOGO_SOURCE_DIR = path.join(__dirname, 'rebrand dossier logo kuro');

const MODULE_LOGOS = {
    word: path.join(LOGO_SOURCE_DIR, 'kuro word.png'),
    sheet: path.join(LOGO_SOURCE_DIR, 'kuro sheet.png'),
    ppt: path.join(LOGO_SOURCE_DIR, 'Kuro Powerpoint.png'),
    reader: path.join(LOGO_SOURCE_DIR, 'kuro reader.png'),
    forms: path.join(LOGO_SOURCE_DIR, 'Kuro forms.png')
};

function processTextFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = content;

        OFFICE_REPLACEMENTS.forEach(({ target, replacement }) => {
            modified = modified.replace(target, replacement);
        });

        if (modified !== content) {
            fs.writeFileSync(filePath, modified, 'utf8');
            console.log(`[Office Rebranded] ${filePath}`);
        }
    } catch (err) {}
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
            if (['.html', '.json', '.js', '.ts', '.jsx', '.tsx', '.vue', '.css', '.scss', '.md', '.env', '.example', '.xml', '.yml', '.yaml', '.rc', '.inf', '.pri', '.pro'].includes(ext) || item.startsWith('.env')) {
                processTextFile(fullPath);
            }
        }
    });
}

function replaceModuleLogos(targetDir) {
    function traverse(dir) {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            if (item === '.git' || item === 'node_modules') return;
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (stat.isFile()) {
                const lower = item.toLowerCase();
                let sourceToCopy = null;

                if (lower.includes('word') || lower.includes('doc') || lower.includes('text')) {
                    sourceToCopy = MODULE_LOGOS.word;
                } else if (lower.includes('sheet') || lower.includes('cell') || lower.includes('calc')) {
                    sourceToCopy = MODULE_LOGOS.sheet;
                } else if (lower.includes('slide') || lower.includes('presentation') || lower.includes('powerpoint')) {
                    sourceToCopy = MODULE_LOGOS.ppt;
                } else if (lower.includes('pdf') || lower.includes('reader')) {
                    sourceToCopy = MODULE_LOGOS.reader;
                } else if (lower.includes('form')) {
                    sourceToCopy = MODULE_LOGOS.forms;
                } else if (lower.includes('logo') || lower.includes('icon') || lower.includes('app')) {
                    sourceToCopy = MODULE_LOGOS.word; // default logo
                }

                if (sourceToCopy && fs.existsSync(sourceToCopy)) {
                    if (lower.endsWith('.png') || lower.endsWith('.ico') || lower.endsWith('.svg')) {
                        try {
                            fs.copyFileSync(sourceToCopy, fullPath);
                            console.log(`[Office Logo Replaced] ${fullPath}`);
                        } catch (e) {}
                    }
                }
            }
        });
    }

    traverse(targetDir);
}

const targetProjectDir = path.join(__dirname, 'upstream', 'kuro-office');
if (fs.existsSync(targetProjectDir)) {
    console.log(`Starting rebranding for Kuro Office: ${targetProjectDir}`);
    processDirectory(targetProjectDir);
    replaceModuleLogos(targetProjectDir);
    console.log(`Completed rebranding for Kuro Office.`);
}
