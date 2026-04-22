const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');

// Get all investments for the user
router.get('/', auth, async (req, res) => {
    try {
        const investments = await Investment.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(investments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add an investment
router.post('/', auth, async (req, res) => {
    try {
        const { 
            name, 
            type, 
            amount, 
            interestRate, 
            duration, 
            startDate, 
            maturityDate, 
            nav, 
            units, 
            currentValue, 
            category, 
            institution 
        } = req.body;

        const newInvestment = new Investment({
            user: req.user.id,
            name,
            type,
            amount,
            interestRate,
            duration,
            startDate,
            maturityDate,
            nav,
            units,
            currentValue,
            category,
            institution
        });

        const investment = await newInvestment.save();
        res.json(investment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update an investment
router.put('/:id', auth, async (req, res) => {
    try {
        let investment = await Investment.findById(req.params.id);

        if (!investment) return res.status(404).json({ message: 'Investment not found' });
        if (investment.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        investment = await Investment.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(investment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete an investment
router.delete('/:id', auth, async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);

        if (!investment) return res.status(404).json({ message: 'Investment not found' });
        if (investment.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await investment.deleteOne();
        res.json({ message: 'Investment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
