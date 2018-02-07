var express = require('express');
var router = express.Router();

var postsRoutes = require('./posts');
var getsRoutes = require('./gets');
var middleware = require('./middleware');

/* Sanitize user sent input */
router.use(middleware.sanitizeProperties);

/* Get settings */
router.all(['/site/:list', '/site/:list/:thread'], middleware.getSettings);

/* GETs */

/* Generate captcha */
router.get(['/site/:list', '/site/:list/:thread'], middleware.generateCaptcha);

/* Process GETs */
router.get('/', getsRoutes.homePage);
router.get('/site/:list/', getsRoutes.listPage);
router.get('/site/:list/:thread/', getsRoutes.threadPage);

router.get('/login', getsRoutes.loginPage);

/* Render */
router.get('/*', middleware.render);

/* POSTs */

/* Error checking functions */
router.post(['/site/:list', '/site/:list/:thread'], middleware.checkPost);
router.post(['/site/:list', '/site/:list/:thread'], middleware.checkCaptcha);
router.post(['/site/:list', '/site/:list/:thread'], middleware.invalidateCaptcha);

/* Modifying functions */
router.post(['/site/:list', '/site/:list/:thread'], middleware.applyFormatting);

/* Process POSTs */
router.post('/site', postsRoutes.makeList);
router.post('/site/:list/', postsRoutes.makeThread);
router.post('/site/:list/:thread/', postsRoutes.makePost);

module.exports = router;
