const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router();

router.post('/signup', isNotLoggedIn, async (req, res, next) => {
    const { username, password, school } = req.body;
    try {
        const exUser = await User.findOne({ where: { username } });
        if (!exUser) {
            const hash = await bcrypt.hash(password, 12);
            await User.create({
                username,
                password: hash,
                school,
            });
            return res.status(201).json({
                message: '회원가입 성공',   
            });
        }
        else {
            return res.status(409).json({
                message: '이미 존재하는 사용자입니다.'
            });
        }
    }
    catch (err){
        console.error(err);
        return next(err);
    }
})
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {    //비밀번호가 틀려서 로그인에 실패하는 경우.
            return res.status(401).json({
                message: "아이디 또는 비밀번호 오류"
            });
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.status(200).json({
                message: '로그인 성공'
            });
        });
    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    // 프런트에 json 형태로 session 종료 알림 전송
    res.json({ message: '로그아웃 되었습니다.' });
});
module.exports = router;