const rules = require('./rules') 

module.exports = (service, options) => {
    const entity = rules[service.entity]
   
    const isEntityDefined = () => {
        if(entity) {
            return true
        } else {
            return false
        }
    }

    const isActionDefined = (action) => {
        if(!isEntityDefined()) return false

        if(entity[action]) {
            return true
        } else {
            return false
        }
    }

    getRequireRolesByAction = (action) => {
        if(isActionDefined(action)) { 
            return entity[action]
        } else {
            return new Set([])
        }
    }

    const isUserAllowed = (userRoles, action) => {
        const defaultResponse = options.allowByDefault

        if(isActionDefined(action)) {
            let requiredRoles = getRequireRolesByAction(action)

            for(index in userRoles) {
                if(requiredRoles.has(userRoles[index])) return true
            }

            return false
            
        } else {
            return defaultResponse
        }
    }

    const whatCanIDo = (userRoles) => {
        let allowedActions = new Set([])

        for(action in entity) {
            requiredRoles = getRequireRolesByAction(action)
                        
            for(index in userRoles) {
                if(requiredRoles.has(userRoles[index])) {
                    if(!allowedActions.has(action)) {
                        allowedActions.add(action)
                    }
                }
            }
        }

        return [...allowedActions]
    }

    const handler = (userRoles) => {
  
        return {
            get: (target, propKey, receiver) => {
                var propValue = target[propKey];

                if(propKey == "whatCanIDo") {
                    return () => {
                       return whatCanIDo(userRoles)
                    }
                }
            
                if(propKey == "canIDoIt") {
                    return () => {
                       return isUserAllowed(userRoles, arguments)
                    }
                }

                if(propKey == "actions") {
                    return [...Object.keys(entity)]
                }

                if(propKey == "entity") {
                    return service.entity
                }

                /**
                 * 
                 */
                if (typeof propValue != "function") {
                    return propValue;

                } else {
                    return () => {
                        if(isUserAllowed(userRoles, propKey)) {
                            return propValue.apply(this, arguments);
                        } else {
                            throw new Error('not allowed')
                        }
                    }
                }
            },

        }
    }

    return (userRoles) => {
        return new Proxy(service, handler(userRoles))
    }
}