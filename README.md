# 🎭 FakeFinder Quiz

**FakeFinder** is an interactive web-based quiz designed to test and improve your ability to detect AI-generated deepfake images. This project combines image obfuscation techniques with a dynamic quiz system to create an engaging learning experience.

## 🌟 Features

- **5-Question Quiz**: Quick, focused assessment of deepfake detection skills
- **Dynamic Image Loading**: Automatically loads from obfuscated image mappings
- **Real-Time Scoring**: Live score tracking with percentage display
- **Randomized Questions**: Each quiz session presents different image pairs
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Obfuscated Images**: Filenames reveal nothing about real/fake classification

## 🚀 Quick Start

### Prerequisites
- Python 3.6 or higher
- A modern web browser
- Basic knowledge of command line operations

### Installation & Setup

1. **Clone or download** this repository to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd FakeFinder
   ```

3. **Generate the image mapping and rename files**:
   ```bash
   python generate_image_mapping.py --rename
   ```
   ⚠️ **Important**: This will permanently rename your image files. A backup will be created automatically.

4. **Open the application**:
   - Open `index.html` in your web browser, or
   - Serve the files using a local web server

## 🔧 How It Works

### Image Obfuscation System
The Python script (`generate_image_mapping.py`) performs several key functions:

1. **Generates random filenames** for all images (e.g., `real_0.jpg` → `x7k9m2p.jpg`)
2. **Creates a JSON mapping file** that JavaScript can read
3. **Maintains the real/fake classification** while hiding it from casual inspection
4. **Backs up original files** before renaming

### Quiz Logic
- **Dynamic Loading**: JavaScript fetches the mapping file and loads images accordingly
- **Random Pair Selection**: Each question randomly selects from 56 available image pairs
- **Position Randomization**: Real and fake images are randomly positioned as A or B
- **Score Tracking**: Real-time updates with percentage calculations

## 📁 Project Structure

```
FakeFinder/
├── images/                 # Image files (renamed with random names)
├── images_backup/          # Backup of original filenames
├── index.html             # Main HTML file
├── script.js              # Quiz logic and functionality
├── styles.css             # Styling and responsive design
├── generate_image_mapping.py  # Python script for image obfuscation
├── image_mapping.json     # Generated mapping file
└── README.md              # This file
```

## 🎯 How to Use

### Taking the Quiz
1. **Start**: Click "Start Quiz" on the welcome screen
2. **Analyze**: Look at both images carefully for signs of AI generation
3. **Select**: Click on the image you believe is the deepfake
4. **Learn**: Get immediate feedback and explanations
5. **Continue**: Complete all 5 questions to see your final score

### Tips for Detection
- Look for **unnatural facial features** or proportions
- Check for **inconsistent lighting** or shadows
- Examine **texture patterns** in skin and hair
- Notice **artifacts** around edges or in backgrounds
- Pay attention to **symmetry** and **anatomical accuracy**

## 🔒 Security & Obfuscation

### Why Obfuscate?
- **Prevents pattern learning** from filename analysis
- **Maintains quiz integrity** across multiple sessions
- **Protects classification data** from casual inspection
- **Enables dynamic mapping** for future updates

### Obfuscation Features
- **12-character random filenames** (e.g., `x7k9m2p.jpg`)
- **No sequential patterns** in naming
- **External mapping file** that can be regenerated
- **Backup system** for easy restoration

## 🛠️ Customization

### Adding More Images
1. Place new images in the `images/` directory
2. Update the count variables in `generate_image_mapping.py`
3. Run the script again to generate new mappings

### Modifying Quiz Length
- Change `this.totalQuestions` in `script.js`
- Update score thresholds in `showResults()` method
- Adjust HTML text references accordingly

## 🌐 Additional Resources

### Deepfake Detection Learning
- **[Northwestern University Deepfake Detection](https://detectfakes.kellogg.northwestern.edu/)** - Excellent resource for diving deeper into deepfake detection techniques and research

## 🐛 Troubleshooting

### Common Issues

**Images not loading (404 errors)**
- Ensure `image_mapping.json` exists and is valid
- Check that image files match the mapping
- Run `python generate_image_mapping.py` to regenerate mappings

**Quiz not starting**
- Check browser console for JavaScript errors
- Verify all files are in the correct directory structure
- Ensure you're running from a web server (not just opening HTML file)

**Score display issues**
- Check that all HTML elements have correct IDs
- Verify JavaScript is loading without errors
- Clear browser cache and refresh

## 🙏 Acknowledgments

- **Image Dataset**: Real and AI-generated images for testing
- **Research Community**: Deepfake detection researchers and developers
- **Open Source Tools**: Libraries and frameworks that made this possible
- **Testers**: Users who provided feedback and bug reports

---

**Happy Deepfake Hunting! 🕵️‍♀️**

*Remember: The best defense against misinformation is education and critical thinking.*

