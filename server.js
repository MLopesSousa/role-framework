const express = require('express')
const server = express()

server.use(express.json())
server.use(require('./routes'))
server.listen(8080, () => {

})