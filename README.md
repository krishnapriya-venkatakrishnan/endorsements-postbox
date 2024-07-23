# Endorsement App using Firebase

This application allows users to post and like endorsements. It utilizes Firebase Realtime Database for storing endorsements and user data. 
The app features user login, real-time updates, and the ability to like posts.

## Features

- User login and logout functionality.
- Add endorsements with receiver, sender, and message.
- Display endorsements in real-time.
- Like endorsements and see the updated number of likes.
- Displays the heart icon based on whether the user has liked the endorsement or not.
- User cannot like his own post.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have a Firebase project with a Realtime Database setup.
- You have a web server to serve your HTML and JavaScript files.

## .env

- Ensure to set the database url in the variable VITE_FIREBASE_URL, which is referred in index.js.

## Live Demo

(https://669fe89421f229084787e7b4--bright-frangipane-639759.netlify.app/)
