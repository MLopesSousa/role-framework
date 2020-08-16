module.exports = {
    User: {
        create: new Set(['ADMIN']),
        update: new Set(['ADMIN']),
        delete: new Set(['ADMIN']),
        list: new Set(['ADMIN', 'ASU']),
    }
}