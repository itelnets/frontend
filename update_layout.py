import re

file_path = 'd:/ecommerce/frontend/src/app/admin/(dashboard)/products/add/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change max-w-3xl to max-w-7xl
content = content.replace('max-w-3xl', 'max-w-7xl')
content = content.replace('<form onSubmit={handleSubmit} className="space-y-4">', '<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">')

# Use regex to find the image section
img_section_regex = re.compile(r'(<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-2">Product Images \(URLs\)</label>.*?</div>\s*</div>\s*</div>)', re.DOTALL)
match = img_section_regex.search(content)

if match:
    img_section = match.group(1)
    # Remove the image section from its current place
    content = content.replace(img_section, '')
    
    # Insert left column and right column open
    form_start = '<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">'
    
    left_col = f"""
                    {{/* Left Column - Sticky Images */}}
                    <div className="lg:col-span-4 space-y-4 lg:sticky top-24 self-start">
                        {img_section}
                    </div>
                    
                    {{/* Right Column - Details */}}
                    <div className="lg:col-span-8 space-y-4">
"""
    content = content.replace(form_start, form_start + left_col)
    
    # Close the right column
    content = content.replace('</form>', '                    </div>\n                </form>')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Layout successfully updated")
else:
    print("Could not find image section")
