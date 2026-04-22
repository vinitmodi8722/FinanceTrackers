const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Debt = require('../models/Debt');

// Get all debts for the user
router.get('/', auth, async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user.id });
        res.json(debts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a debt
router.post('/', auth, async (req, res) => {
    try {
        const { creditor, balance, apr, minPayment } = req.body;

        const newDebt = new Debt({
            creditor,
            balance,
            apr,
            minPayment,
            user: req.user.id
        });

        const debt = await newDebt.save();
        res.json(debt);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a debt
router.put('/:id', auth, async (req, res) => {
    try {
        const { balance, minPayment, apr } = req.body;
        let debt = await Debt.findById(req.params.id);

        if (!debt) return res.status(404).json({ message: 'Debt not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        if (balance !== undefined) debt.balance = balance;
        if (minPayment !== undefined) debt.minPayment = minPayment;
        if (apr !== undefined) debt.apr = apr;

        await debt.save();
        res.json(debt);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a debt
router.delete('/:id', auth, async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ message: 'Debt not found' });
        if (debt.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        await debt.deleteOne();
        res.json({ message: 'Debt removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
