const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Load profile data
const profile = require('./src/profile.json');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets to dist (not in a subfolder)
const publicDir = path.join(__dirname, 'public');

if (fs.existsSync(publicDir)) {
  // Copy all files from public to dist
  const copyRecursive = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyRecursive(publicDir, distDir);
}

// Render EJS templates to static HTML
const viewsDir = path.join(__dirname, 'views');
const pages = ['home', 'experience', 'projects', 'contact', '404'];

// Configure EJS to find includes
ejs.fileLoader = (filePath) => {
  // Handle relative paths from the views directory
  if (filePath.startsWith('../')) {
    const fullPath = path.join(__dirname, 'views', filePath);
    return fs.readFileSync(fullPath, 'utf8');
  }
  return fs.readFileSync(filePath, 'utf8');
};

pages.forEach(page => {
  const templatePath = path.join(viewsDir, 'pages', `${page}.ejs`);
  
  if (fs.existsSync(templatePath)) {
    try {
      const template = fs.readFileSync(templatePath, 'utf8');
      const html = ejs.render(template, { 
        profile,
        success: false,
        form: {},
        errors: {}
      }, {
        filename: templatePath,
        root: viewsDir
      });
      
      // Write to dist directory
      const outputPath = page === 'home' ? 
        path.join(distDir, 'index.html') : 
        path.join(distDir, `${page}.html`);
      
      fs.writeFileSync(outputPath, html);
      console.log(`Built: ${outputPath}`);
    } catch (error) {
      console.error(`Error building ${page}:`, error.message);
    }
  }
});

// Create a simple index.html if home page doesn't exist
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const simpleIndex = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Omar Mohamed Saleh - Portfolio</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <div class="container">
        <h1>Omar Mohamed Saleh</h1>
        <p>Software Engineering Student</p>
        <nav>
            <a href="/experience.html">Experience</a>
            <a href="/projects.html">Projects</a>
            <a href="/contact.html">Contact</a>
        </nav>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(indexPath, simpleIndex);
  console.log('Created simple index.html');
}

console.log('Build completed successfully!');
