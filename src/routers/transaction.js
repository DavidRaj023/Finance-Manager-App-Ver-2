const express = require('express');
const Transaction = require('../models/transaction');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/transaction', auth, async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        owner: req.user._id
    })

    try {
        const we = await transaction.save();
        res.status(201).send(transaction);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

// GET /transactions?flow=out
// GET /transactions?limit=10&skip=20
// GET /transactions
router.get('/transactions', auth, async (req, res) => {
    const match = {}
    const sort = {}
    try {
        match.owner = req.user._id;
        if (req.query.flow) {
            if (req.query.flow == 'out') {
                match.flow = 'Money Out'
            } else {
                match.flow = 'Money In'
            }

        }

        if (req.body.start && req.body.end) {
            match.date = {
                $gte: req.body.start,
                $lte: req.body.end
            }
        }
        console.log(match);
        const transactions = await Transaction.find(
            match,
            '_id flow description amount note date createdAt updatedAt', {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
            }
        );
        res.send(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message
        })
    }
});

router.get('/transactions/:id', auth, async (req, res) => {
    const _id = req.params.id;


    try {
        const transaction = await Transaction.findOne({
            _id,
            owner: req.user._id
        });

        if (!transaction) {
            return res.status(404).send();
        }

        res.send(transaction);
    } catch (e) {
        res.status(500).send();
    }
})

//Update by id
router.patch('/transaction/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['flow', 'description', 'amount', 'note'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        });
    }

    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!transaction) {
            return res.status(404).send();
        }

        updates.forEach((update) => transaction[update] = req.body[update]);
        await transaction.save();
        res.send(transaction);
    } catch (e) {
        res.status(400).send(e);
    }
})

//Delete By id
router.delete('/transaction/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!transaction) {
            res.status(404).send();
        }

        res.send(transaction);
    } catch (e) {
        res.status(500).send();
    }
})

// GET Balance
router.get('/balance', auth, async (req, res) => {
    try {
        const moneyIn = await Transaction.aggregate([
            { $match: { owner: req.user._id, flow: 'Money In' } },
            { $group: { _id: req.user._id, moneyIn: { $sum: "$amount" } } }
        ])
        const moneyOut = await Transaction.aggregate([
            { $match: { owner: req.user._id, flow: 'Money Out' } },
            { $group: { _id: req.user._id, moneyOut: { $sum: "$amount" } } }
        ])
        const balance = {
            income: moneyIn[0].moneyIn,
            expenditure: moneyOut[0].moneyOut,
            balance: (moneyIn[0].moneyIn) - (moneyOut[0].moneyOut)
        }
        res.send(balance);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message
        })
    }
})
module.exports = router