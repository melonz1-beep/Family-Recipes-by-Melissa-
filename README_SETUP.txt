# Melissa's Recipe Binder - Firebase + Splash Page Version

This ZIP includes:
- Firebase Realtime Database setup
- Lavender and sunflower farmhouse theme
- Feminine app icon
- Splash page using the same icon
- All-recipe categories
- Search recipes
- Freezer inventory
- Shopping list
- Holiday menus
- Meal planning
- Family notes

## Firebase setup

1. Go to Firebase Console.
2. Create or open your project.
3. Go to Build > Realtime Database.
4. Create database.
5. Start in test mode while setting up.
6. Go to Project Settings > General.
7. Add a Web App if needed.
8. Copy the Firebase config.
9. Open `app.js`.
10. Replace the placeholder `firebaseConfig` at the top with your real config.
11. Save/commit to GitHub.

## Temporary testing rules

{
  "rules": {
    ".read": true,
    ".write": true
  }
}

## GitHub Pages

Upload all files in this ZIP to your repository:
- index.html
- style.css
- app.js
- manifest.json
- sw.js
- icon-192.png
- icon-512.png
- splash-logo.png

Then open your GitHub Pages link and add it to your home screen.
