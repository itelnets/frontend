const fs = require('fs');
const file_path = 'd:/ecommerce/frontend/src/app/admin/(dashboard)/products/add/page.tsx';

let content = fs.readFileSync(file_path, 'utf8');

// Change max-w-3xl to max-w-7xl
content = content.replace('max-w-3xl', 'max-w-7xl');
content = content.replace('<form onSubmit={handleSubmit} className="space-y-4">', '<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">');

// Use regex to find the image section
const img_section_regex = /(<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-2">Product Images \(URLs\)<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
const match = content.match(img_section_regex);

if (match) {
    const img_section = match[1];
    // Remove the image section from its current place
    content = content.replace(img_section, '');
    
    // Insert left column and right column open
    const form_start = '<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">';
    
    const left_col = `
                    {/* Left Column - Sticky Images */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky top-24 self-start">
                        ${img_section}
                    </div>
                    
                    {/* Right Column - Details */}
                    <div className="lg:col-span-8 space-y-4">
`;
    
    content = content.replace(form_start, form_start + left_col);
    
    // Close the right column
    content = content.replace('</form>', '                    </div>\n                </form>');
    
    fs.writeFileSync(file_path, content, 'utf8');
    console.log('Layout successfully updated');
} else {
    console.log('Could not find image section');
}
