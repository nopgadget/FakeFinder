#!/usr/bin/env python3
"""
FakeFinder Image Mapping Generator
This script renames image files with random names and creates a mapping file for JavaScript
"""

import random
import string
import os
import json
import shutil

# Configuration
REAL_IMAGE_COUNT = 56  # 0-55 = 56 images
FAKE_IMAGE_COUNT = 56  # 0-55 = 56 images
IMAGE_EXTENSION = ".jpg"
MAPPING_FILE = "image_mapping.json"

def generate_random_filename():
    """Generate a random 12-character filename for better uniqueness"""
    chars = string.ascii_lowercase + string.digits
    filename = ''.join(random.choice(chars) for _ in range(12))
    return filename + IMAGE_EXTENSION

def generate_unique_filenames(count):
    """Generate unique random filenames"""
    filenames = set()
    while len(filenames) < count:
        filenames.add(generate_random_filename())
    return list(filenames)

def create_mapping_file(real_filenames, fake_filenames):
    """Create a JSON mapping file that JavaScript can read"""
    mapping = {
        "metadata": {
            "total_images": REAL_IMAGE_COUNT + FAKE_IMAGE_COUNT,
            "real_count": REAL_IMAGE_COUNT,
            "fake_count": FAKE_IMAGE_COUNT,
            "generated_at": "2024-01-01"  # You can make this dynamic if needed
        },
        "images": {},
        "pairs": []
    }
    
    # Create individual image mappings
    for i in range(REAL_IMAGE_COUNT):
        key = f"real_{i}"
        mapping["images"][key] = f"images/{real_filenames[i]}"
    
    for i in range(FAKE_IMAGE_COUNT):
        key = f"fake_{i}"
        mapping["images"][key] = f"images/{fake_filenames[i]}"
    
    # Create pairs for quiz questions
    for i in range(min(REAL_IMAGE_COUNT, FAKE_IMAGE_COUNT)):
        pair = {
            "id": f"pair_{i}",
            "real": f"images/{real_filenames[i]}",
            "fake": f"images/{fake_filenames[i]}",
            "real_key": f"real_{i}",
            "fake_key": f"fake_{i}"
        }
        mapping["pairs"].append(pair)
    
    # Write the mapping file
    with open(MAPPING_FILE, 'w') as f:
        json.dump(mapping, f, indent=2)
    
    return mapping

def rename_files(real_filenames, fake_filenames):
    """Actually rename the image files"""
    print("Renaming files...")
    
    # Create backup directory
    backup_dir = "images_backup"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # Backup and rename real images
    for i in range(REAL_IMAGE_COUNT):
        old_name = f"images/real_{i}.jpg"
        new_name = f"images/{real_filenames[i]}"
        
        if os.path.exists(old_name):
            # Create backup
            backup_name = f"{backup_dir}/real_{i}.jpg"
            shutil.copy2(old_name, backup_name)
            
            # Rename the file
            os.rename(old_name, new_name)
            print(f"✓ Renamed: real_{i}.jpg -> {real_filenames[i]}")
        else:
            print(f"⚠ Warning: {old_name} not found")
    
    # Backup and rename fake images
    for i in range(FAKE_IMAGE_COUNT):
        old_name = f"images/fake_{i}.jpg"
        new_name = f"images/{fake_filenames[i]}"
        
        if os.path.exists(old_name):
            # Create backup
            backup_name = f"{backup_dir}/fake_{i}.jpg"
            shutil.copy2(old_name, backup_name)
            
            # Rename the file
            os.rename(old_name, new_name)
            print(f"✓ Renamed: fake_{i}.jpg -> {fake_filenames[i]}")
        else:
            print(f"⚠ Warning: {old_name} not found")
    
    print(f"\n📁 Backup created in '{backup_dir}' directory")
    print("💡 You can restore original names by copying files back from backup")

def generate_javascript_code(mapping):
    """Generate JavaScript code that can be copied to script.js"""
    print("\n" + "="*60)
    print("JAVASCRIPT CODE FOR script.js")
    print("="*60)
    print()
    
    print("// Replace the getImagePairs() method in your FakeFinderQuiz class with this:")
    print()
    print("getImagePairs() {")
    print("    // Load mapping from external file")
    print("    const imageMap = {")
    
    # Output the image mappings
    for key, path in mapping["images"].items():
        print(f"        '{key}': '{path}',")
    
    print("    };")
    print()
    print("    // Create pairs for quiz questions")
    print("    const pairs = [")
    
    for i, pair in enumerate(mapping["pairs"]):
        comma = "," if i < len(mapping["pairs"]) - 1 else ""
        print(f"        {{ primary: imageMap['{pair['real_key']}'], secondary: imageMap['{pair['fake_key']}'], key: 'pair_{i}' }}{comma}")
    
    print("    ];")
    print()
    print("    // Shuffle the pairs to add randomness")
    print("    return this.shuffleArray(pairs);")
    print("}")
    print()
    print("// Alternative: Load mapping from JSON file dynamically")
    print("// async loadImageMapping() {")
    print("//     try {")
    print(f"//         const response = await fetch('{MAPPING_FILE}');")
    print("//         const mapping = await response.json();")
    print("//         return mapping.pairs;")
    print("//     } catch (error) {")
    print("//         console.error('Error loading image mapping:', error);")
    print("//         return [];")
    print("//     }")
    print("// }")

def main():
    print("🎯 FakeFinder Image Mapping Generator")
    print("=" * 50)
    print()
    
    # Check if images directory exists
    if not os.path.exists("images"):
        print("❌ Error: 'images' directory not found!")
        print("   Make sure you're running this script from the project root directory.")
        return
    
    # Generate random filenames
    print("🔐 Generating random filenames...")
    real_filenames = generate_unique_filenames(REAL_IMAGE_COUNT)
    fake_filenames = generate_unique_filenames(FAKE_IMAGE_COUNT)
    
    # Create the mapping file
    print("📝 Creating mapping file...")
    mapping = create_mapping_file(real_filenames, fake_filenames)
    print(f"✅ Created {MAPPING_FILE}")
    
    # Show summary
    print(f"\n📊 Summary:")
    print(f"   • Real images: {REAL_IMAGE_COUNT}")
    print(f"   • Fake images: {FAKE_IMAGE_COUNT}")
    print(f"   • Total pairs: {len(mapping['pairs'])}")
    print(f"   • Mapping file: {MAPPING_FILE}")
    
    # Generate JavaScript code
    generate_javascript_code(mapping)
    
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Run this script with --rename to actually rename the files")
    print("2. Copy the JavaScript code above to your script.js file")
    print("3. Test your application!")
    print()
    print("To rename files now, run: python generate_image_mapping.py --rename")

if __name__ == "__main__":
    import sys
    
    if "--rename" in sys.argv:
        # Execute the rename operations
        print("🚀 Executing rename operations...")
        print("⚠️  This will permanently rename your image files!")
        print("   A backup will be created in 'images_backup' directory")
        print()
        
        # Confirm with user
        response = input("Continue? (y/N): ").strip().lower()
        if response != 'y':
            print("❌ Operation cancelled.")
            sys.exit(0)
        
        # Generate filenames again for consistency
        real_filenames = generate_unique_filenames(REAL_IMAGE_COUNT)
        fake_filenames = generate_unique_filenames(FAKE_IMAGE_COUNT)
        
        # Create mapping file first
        mapping = create_mapping_file(real_filenames, fake_filenames)
        
        # Then rename files
        rename_files(real_filenames, fake_filenames)
        
        print("\n🎉 Rename operations completed!")
        print(f"📁 Check '{MAPPING_FILE}' for the complete mapping")
        print("💾 Original files backed up in 'images_backup' directory")
        
    else:
        main()
