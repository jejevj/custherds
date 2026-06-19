const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let totalReplaced = 0;
walkDir('f:/weblayout/tecture/vue js/code git/tecture-vue/src/assets/css', function (filePath) {
    if (!filePath.endsWith('.css')) return;
    if (filePath.includes('owl.carousel') || filePath.includes('owl.theme')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const org = content;

    content = content.replace(/\.owl-carousel/g, '.swiper');
    content = content.replace(/\.owl-stage-outer/g, '');
    content = content.replace(/\.owl-stage/g, '.swiper-wrapper');
    content = content.replace(/\.owl-item/g, '.swiper-slide');
    content = content.replace(/\.owl-nav/g, '[class*="-prev"], [class*="-next"]');
    content = content.replace(/\.owl-prev/g, '[class*="-prev"]');
    content = content.replace(/\.owl-next/g, '[class*="-next"]');
    content = content.replace(/\.owl-dots/g, '.swiper-pagination');
    content = content.replace(/\.owl-dot/g, '.swiper-pagination-bullet');
    content = content.replace(/\.owl-theme/g, '');

    if (org !== content) {
        totalReplaced++;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Replaced in:', path.basename(filePath));
    }
});
console.log('Total files modified:', totalReplaced);
