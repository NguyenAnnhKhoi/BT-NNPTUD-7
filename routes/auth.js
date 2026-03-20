var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, ChangePasswordValidator, handleResultValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwtHandler = require('../utils/jwtHandler')
let {checkLogin} = require('../utils/authHandler')
/* GET home page. */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    try {
        let newUser = userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            "69aa756c4e009e66a8bd4c15"
        );
        await newUser.save()
        res.send({
            message: "dang ki thanh cong"
        })
    } catch (err) {
        res.status(400).send({ 
            message: "Lỗi khi đăng kí",
            error: err.message 
        });
    }
});
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
            let token = jwtHandler.signToken({
                id: getUser._id
            }, {
                expiresIn: '30d'
            });
            res.send(token)
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});
router.get('/me',checkLogin,function(req,res,next){
    res.send(req.user)
})

router.post('/changepassword', checkLogin, ChangePasswordValidator, handleResultValidator, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        let user = req.user;

        // Kiểm tra mật khẩu cũ
        if (!bcrypt.compareSync(oldpassword, user.password)) {
            return res.status(403).send("mat khau cu khong dung");
        }

        // Kiểm tra mật khẩu mới khác mật khẩu cũ
        if (oldpassword === newpassword) {
            return res.status(403).send("mat khau moi phai khac mat khau cu");
        }

        // Không hash ở đây, để schema tự hash khi save
        await userController.ChangePassword(user, newpassword);

        res.send({
            message: "doi mat khau thanh cong"
        });
    } catch (error) {
        res.status(500).send({
            message: "loi khi thay doi mat khau",
            error: error.message
        });
    }
});

// ⚠️ Endpoint dành cho DEV/TEST: Xóa tất cả users (dùng để fix lại DB khi mật khẩu hash 2 lần)
router.delete('/cleanup-users', async function (req, res, next) {
    try {
        let userModel = require('../schemas/users');
        let result = await userModel.deleteMany({});
        res.send({
            message: "Xóa tất cả users thành công",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).send({
            message: "Lỗi khi xóa users",
            error: error.message
        });
    }
});

module.exports = router;
