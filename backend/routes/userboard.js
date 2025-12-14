const express = require('express');
const Score = require('../models/score');
const User = require('../models/user');
const { fn, col, literal } = require('sequelize');
const { isLoggedIn, checkType } = require('./middlewares')

const router = express.Router();

//프런트의 DB 요청을 처리하는 라우터입니다.
router.get('/info', isLoggedIn, async (req, res, next) => {
    try {
        const school = req.user.school;
        const top10 = await Score.findAll({
            attributes: [
                'user_id',
                [fn('MAX', col('avg_wpm')), 'maxAvgWpm'],
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['username', 'name', 'school'],
                where: { school },
                required: true,
            }],
            group: ['Score.user_id', 'user.user_id', 'user.school'],
            order: [[literal('maxAvgWpm'), 'DESC']],
            limit: 10,
            raw: true,
            nest: true,
        });
        return res.status(200).json(top10)
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/summaryCards/:type', isLoggedIn, checkType, async (req, res, next) => {
  try {
    const { type } = req.params;
    const user_id = req.user.user_id;

    const stats = await Score.findOne({
      where: { user_id, type },
      attributes: [
        [fn('COUNT', col('id')), 'totalGames'],     
        [fn('MAX', col('avg_wpm')), 'bestAvgWpm'],  
        [fn('AVG', col('avg_wpm')), 'avgWpm'],
      ],
      raw: true,
    });

    return res.status(200).json({
      totalGames: Number(stats?.totalGames ?? 0),
      bestavgWpmData: Number(stats?.bestAvgWpm ?? 0),
      avgWpmData: Number(stats?.avgWpm ?? 0),
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});


router.post('/practice', isLoggedIn, async (req, res, next) => {
    try {
        const { avgWpm, maxWpm, elapsedTime, type } = req.body;
        await Score.create({
            user_id: req.user.user_id,
            avgWpm,
            maxWpm,
            elapsedTime,
            type,
        });
        return res.status(201).json({
            message: '연습 기록 저장 완료',
        })
    }catch (err){
        console.error(err);
        return next(err);
    }
});

module.exprorts = router;