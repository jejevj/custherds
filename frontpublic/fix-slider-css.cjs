const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;
walkDir('f:/weblayout/tecture/vue js/code git/tecture-vue/src/assets/css', function (filePath) {
    if (!filePath.endsWith('.css')) return;
    if (filePath.includes('owl.carousel') || filePath.includes('owl.theme')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const org = content;

    // Carousel container
    content = content.replace(/\.owl-carousel/g, '.swiper');
    content = content.replace(/\.owl-theme/g, '');

    // Wrappers
    content = content.replace(/\.owl-stage-outer/g, '.swiper');
    content = content.replace(/\.owl-stage/g, '.swiper-wrapper');

    // Slides (vital!)
    content = content.replace(/\.owl-item\.active/g, '.swiper-slide-visible, .swiper-slide-active');
    content = content.replace(/\.owl-item/g, '.swiper-slide');

    // Navigation blocks
    content = content.replace(/\.owl-nav\s+\.owl-prev/g, '.swiper-prev, [class*="-prev"]');
    content = content.replace(/\.owl-nav\s+\.owl-next/g, '.swiper-next, [class*="-next"]');
    content = content.replace(/\.owl-prev/g, '.swiper-prev, [class*="-prev"]');
    content = content.replace(/\.owl-next/g, '.swiper-next, [class*="-next"]');

    // The nav container itself (often used for flex alignment)
    content = content.replace(/\.owl-nav/g, '');

    // Pagination
    content = content.replace(/\.owl-dots/g, '.swiper-pagination');
    content = content.replace(/\.owl-dot\.active/g, '.swiper-pagination-bullet-active');
    content = content.replace(/\.owl-dot/g, '.swiper-pagination-bullet');

    if (org !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed CSS in:', path.basename(filePath));
        modified++;
    }
});
console.log('Total fixed:', modified);
