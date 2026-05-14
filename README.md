# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript. Deploy to GitHub Pages for free!

## Features

- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern and clean UI with smooth animations
- ⚡ Fast loading with no external dependencies
- 🔍 SEO friendly structure
- 💫 Smooth scroll navigation
- 🎯 Easy to customize

## Sections

- **Hero**: Eye-catching introduction
- **About**: Brief bio section
- **Projects**: Showcase your work
- **Skills**: Display your expertise
- **Contact**: Links to reach you
- **Footer**: Copyright info

## Customization

1. **Edit your info**: Replace "Your Name", email, and social links in `index.html`
2. **Update projects**: Add your project details and links
3. **Modify colors**: Edit CSS variables in `styles.css` (`:root` section)
4. **Add images**: Replace placeholder images with your own

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

## File Structure

```
portfolio-website/
├── index.html       # Main HTML file
├── styles.css       # Styling
├── script.js        # JavaScript functionality
└── README.md        # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips for Success

✨ **Before deploying:**
1. Update your name and bio
2. Replace placeholder images
3. Add your real project links
4. Update contact information
5. Customize colors to match your brand

## Further Customization

### Adding a blog section
Create a new section after skills:
```html
<section id="blog" class="blog">
    <div class="container">
        <h2>Latest Posts</h2>
        <!-- Add blog posts here -->
    </div>
</section>
```

### Adding more projects
Duplicate the `.project-card` div and update the content.

### Changing the color scheme
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-accent;
    /* ... other colors ... */
}
```

## License

Free to use for personal and commercial projects.

---

**Happy coding! 🚀**
