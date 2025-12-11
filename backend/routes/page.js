const express = require('express');
const router = express.Router();

// 프런트에서 요청받아서 처리할 페이지 라우터
router.get('/', (req, res) => {
    res.render('login');
});

router.get('/join', (req, res) => {
    res.render('join');
});
    
module.exports = router;