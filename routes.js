const router = require('express').Router();
const service = require('./service')
const authorizationProxy = require('./authorizationProxy')


router.get('/', function(req, res) {
    const userRoles = req.headers.roles.split(' ')
    const userService = authorizationProxy(service, { allowByDefault: false })(userRoles)

    try {
        let _return = { results: userService.list(), actions: [] }
        for(action of userService.whatCanIDo().values()) {
            _return.actions.push({ rel: action, href: userService.entity })
        }

        res.json(_return)
    } catch (error) {
        if(error.message == 'not allowed') res.send(401)
    }

    
});

module.exports = router