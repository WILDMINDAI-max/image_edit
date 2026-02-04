const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'templates', 'data');
console.log('Scanning directory:', dataDir);

try {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    const categories = {};

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const templates = JSON.parse(content);

            if (!Array.isArray(templates)) {
                console.log(`Warning: ${file} does not contain an array.`);
                return;
            }

            templates.forEach(template => {
                const category = template.category || file.replace('.json', '');
                // Some templates might not have a theme, handle that
                const theme = template.theme || 'Uncategorized';

                if (!categories[category]) {
                    categories[category] = {};
                }
                if (!categories[category][theme]) {
                    categories[category][theme] = 0;
                }
                categories[category][theme]++;
            });

        } catch (err) {
            console.error(`Error reading/parsing ${file}:`, err.message);
        }
    });

    const output = [];
    output.push('--- Template Statistics ---');
    output.push(`Total Categories: ${Object.keys(categories).length}`);

    let totalTemplates = 0;

    Object.keys(categories).forEach(cat => {
        const themes = categories[cat];
        output.push(`\nCategory: ${cat}`);
        output.push(`  Total Themes: ${Object.keys(themes).length}`);
        Object.keys(themes).forEach(theme => {
            const count = themes[theme];
            totalTemplates += count;
            output.push(`    Theme: ${theme}, Templates: ${count}`);
        });
    });

    output.push(`\n--- Grand Total ---`);
    output.push(`Total Templates: ${totalTemplates}`);

    console.log(output.join('\n'));
    fs.writeFileSync(path.join(__dirname, 'template_stats.txt'), output.join('\n'), 'utf8');
    console.log('Statistics written to template_stats.txt');

} catch (err) {
    console.error('Error listing directory:', err);
}
