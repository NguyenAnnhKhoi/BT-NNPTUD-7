let userController = require('../controllers/users')
let jwtHandler = require('./jwtHandler')
module.exports = {
    checkLogin: async function (req, res, next) {
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer")) {
            return res.status(403).send("ban chua dang nhap");
        }
        token = token.split(" ")[1];
        try {//private - public
            let result = jwtHandler.verifyToken(token)
            let user = await userController.FindById(result.id)
            if (!user) {
                return res.status(403).send("ban chua dang nhap");
            } else {
                req.user = user;
                next()
            }
        } catch (error) {
            if (error.message && error.message.includes('not found at')) {
                return res.status(500).send(error.message);
            }
            res.status(403).send("ban chua dang nhap");
        }

    }
}