var express = require('express');
var router = express.Router();

var postsRoutes = require('./posts');
var getsRoutes = require('./gets');
var middleware = require('./middleware');

/* Sanitize user sent input */
router.use(middleware.sanitizeProperties);

/* Performance */
router.get('/', getsRoutes.homePage);
router.get('/site/:list/', getsRoutes.listPage);
router.get('/site/:list/:thread/', getsRoutes.threadPage);

/* POSTs */

/* Error checking functions */
router.post(['/site/:list', '/site/:list/:thread'], middleware.checkPost);
router.post(['/site/:list', '/site/:list/:thread'], middleware.checkCaptcha);
router.post(['/site/:list', '/site/:list/:thread'], middleware.invalidateCaptcha);

/* Modifying functions */
router.post(['/site/:list', '/site/:list/:thread'], middleware.applyFormatting);

/* Performance */
router.post('/site', postsRoutes.makeList);
router.post('/site/:list/', postsRoutes.makeThread);
router.post('/site/:list/:thread/', postsRoutes.makePost);

module.exports = router;
