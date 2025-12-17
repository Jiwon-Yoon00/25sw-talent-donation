const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router();

//Login, Sineup, Logout을 담당하는 라우터입니다.
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
    const { username, password, school } = req.body;
    const user_id = username;
    try {
        const exUser = await User.findOne({ where: { user_id } });
        if (!exUser) {
            const hash = await bcrypt.hash(password, 12);
            await User.create({
                user_id,
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
});

// auth/login으로 post 요청(아이디, 패스워드) 보내주시면 여기서 처리합니다.
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
//delete /auth/quit 요청해주시면 해당 유저 삭제하고 로그아웃한 뒤 session도 삭제합니다.
router.delete('/quit', isLoggedIn, async (req, res, next) => {
    const user_id = req.user.user_id;
    try{
        await User.destroy({
            where:{ user_id }
        });
        req.logout((err) => {
            if(err) return next(err);
            req.session.destroy((err2) => {
                if(err2) return next(err2);
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: '회원탈퇴가 완료되었습니다.' });
            });
        });   
    }catch(err){
        console.error(err);
        next(err);
    }
});

//프런트에서 로그인상태를 확인하고자 할때 사용할 api
router.get('/check', (req, res) => {
  if(req.isAuthenticated()){
    res.status(200).json({
      isLoggedIn: true,
    });
  }else{
    res.status(200).json({
      isLoggedIn: false,
    });    
  }
});

//get /auth/logout 요청해주시면 로그아웃 처리하고 session을 종료합니다.
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout((err) => {
        if(err) return next(err);
        req.session.destroy((err2) => {
            if(err2) return next(err2);
            
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: '회원탈퇴가 완료되었습니다.' });
        });
    });  
});
module.exports = router;