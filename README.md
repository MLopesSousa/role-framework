# Framework to validate API calls based on requester roles, HTTP Header roles.

The **roles** header should contain the **roles** separated by space.
```
GET http://localhost:8080/ HTTP/1.1
Content-Type: application/json
roles: ADMIN ASU

 {  }
 
```

#### To enable the validation on API calls, the following steps should be done.
Add the **entity** property in the service that should be protected by the validation.

### **`service.js`**
```javascript
module.exports = {
  list: () => {
    return [
      { name: "Joao", age: 60 },
      { name: "Miguel", age: 20 },
      { name: "Pedro", age: 50 },
    ];
  },
  entity: "User",
};

```

Create the rules file. This file should contain one element by the entity. Inside the entity element, all the protected actions should be listed with a set of roles that has permission to perform it. In the example bellow, the role **ADMIN** has permission to perform the actions: **create, update, delete and list** on the entity **user** while the role **ASU** has only the **list** permission on the **user** entity. 

### **`rules.js`**
```javascript
module.exports = {
    User: {
        create: new Set(['ADMIN']),
        update: new Set(['ADMIN']),
        delete: new Set(['ADMIN']),
        list: new Set(['ADMIN', 'ASU']),
    }
}

```

The route should be configured to use the **authorizationProxy**.

### **`routes.js`**
```javascript
router.get('/', function(req, res) {
    /** get the roles **/
    const userRoles = req.headers.roles.split(' ')
    
    /** create the authorizationProxy object passing as parameter the service that should be protected, the option allowByDefault instructs the authorizationProxy to throw an error if the requested method is not defined inside the roles.js file **/
    const userService = authorizationProxy(service, { allowByDefault: false })(userRoles)

    try {
        /** define the object returned by the request. This is done in order to provide more information to the API caller. **/
        let _return = { results: userService.list(), actions: [] }

         /** creating the list of action allowed for this user **/
        for(action of userService.whatCanIDo().values()) {
            _return.actions.push({ rel: action, href: userService.entity })
        }
        
        res.json(_return)
    } catch (error) {
        if(error.message == 'not allowed') res.status(401)
    }
    
});
```

#### Methods avaliable in the **authorizationProxy** API.
```entity``` (retrieve the entity being managed by the authorizationProxy)
```actions``` (retrieve the list of actions managed by the authorizationProxy in the specific entity)
```whatCanIDo()``` (retrieve the list of actions available for the API caller)
```canIDoIt(action) ``` (validates if the API caller can perform the specified action on the entity)

#### HTTP call examples 
**`request.http`**.

```
### a simple test with the most basic Role
GET http://localhost:8080/ HTTP/1.1
Content-Type: application/json
roles: ASU

 { }
```

```json
 {
  "results": [
    {
      "name": "Joao",
      "age": 60
    },
    {
      "name": "Miguel",
      "age": 20
    },
    {
      "name": "Pedro",
      "age": 50
    }
  ],
  "actions": [
    {
      "rel": "list",
      "href": "User"
    }
  ]
}
```

```
GET http://localhost:8080/ HTTP/1.1
Content-Type: application/json
roles: ADMIN ASU

 {}
```

```json
{
  "results": [
    {
      "name": "Joao",
      "age": 60
    },
    {
      "name": "Miguel",
      "age": 20
    },
    {
      "name": "Pedro",
      "age": 50
    }
  ],
  "actions": [
    {
      "rel": "create",
      "href": "User"
    },
    {
      "rel": "update",
      "href": "User"
    },
    {
      "rel": "delete",
      "href": "User"
    },
    {
      "rel": "list",
      "href": "User"
    }
  ]
}
```

```
### a simple test with unknown Role
GET http://localhost:8080/ HTTP/1.1
Content-Type: application/json
roles: DEV

 {}
 ```
 
 ```json
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 12
ETag: W/"c-dAuDFQrdjS3hezqxDTNgW7AOlYk"
Date: Sun, 16 Aug 2020 22:38:51 GMT
Connection: close

Unauthorized
 ```
