# Penetration Testing Portfolio

A professional penetration testing portfolio website with a cybersecurity theme. Red, black, and white color scheme with modern offensive security branding.

## Features

- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔴 Cybersecurity red/black/white theme
- 🎯 Penetration testing portfolio template
- ⚡ Fast loading with no external dependencies
- 🔍 SEO friendly structure
- 💫 Smooth scroll navigation and effects
- 🎨 Professional security-focused design

## Sections

- **Hero**: Eye-catching offensive security introduction
- **Security Profile**: Bio and professional summary
- **Security Engagements**: Showcase your penetration tests and assessments
- **Technical Expertise**: Display your security tools and techniques
- **Engagement Inquiry**: Contact section for consultations
- **Footer**: Legal disclaimer for authorized testing

## Customization

1. **Edit your info**: Replace email, links, and social profiles in `index.html`
2. **Add your engagements**: Update project cards with your penetration tests and assessments
3. **Update skills**: Modify security tools and techniques in the skills section
4. **Color scheme**: Primary red (#ff0000), backgrounds black (#000000), text white (#ffffff)

## Deploying to GitHub Pages

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Create a new repository named `yourusername.github.io`
3. Replace `yourusername` with your actual GitHub username

### Step 2: Push Your Code
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial portfolio setup"

# Add remote repository
git remote add origin https://github.com/yourusername/yourusername.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Access Your Site
Your portfolio will be live at: `https://yourusername.github.io`

### Step 4: Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Set Source to `Deploy from a branch`
4. Select `main` branch with `/root` folder
5. Wait 1-2 minutes for deployment

## File Structure

```
portfolio-website/
├── index.html       # Main HTML - Security engagement sections
├── styles.css       # Cybersecurity red/black/white theme
├── script.js        # JavaScript functionality
└── README.md        # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Text/Borders) | Red | #ff0000 |
| Background | Black | #000000 |
| Text | White | #ffffff |

## Customization Tips

✨ **Before deploying:**
1. Update your name/title
2. Add your penetration testing engagements
3. List your security tools and expertise
4. Update contact information
5. Add links to reports or portfolio pieces

### Adding More Engagements
Duplicate the `.project-card` div and update:
- Engagement title
- Description of scope and findings
- Testing methodology tags
- Link to full report

### Updating Security Skills
Edit the three skill categories to reflect your expertise:
- Vulnerability Analysis
- Exploitation Techniques
- Security Tools

## Important Notes

⚠️ **Legal Disclaimer**: All penetration testing must be authorized. This portfolio is for showcasing legitimate, authorized security assessments only.

## License

Free to use for personal and professional security portfolio purposes.

---

**Built for cybersecurity professionals. 🔒**
