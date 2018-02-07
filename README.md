# Impala
Express.js forum

### Prereqs
- MongoDB

### Usage
`npm install`
`npm start`

### Front-end
The current repository uses a default front-end. It's not very spicy. You can write your own or modify existing front-ends. On the site, your pug file will be passed `settings` with the settings of the current board (name, etc.), `svgCaptcha` with a picture of the captcha, and either `postList` or `threadList` depending on if you're accessing a thread or a listing.

