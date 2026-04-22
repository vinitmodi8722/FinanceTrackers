const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');

// Get all goals for the user
router.get('/', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a goal
router.post('/', auth, async (req, res) => {
    try {
        const { name, targetAmount, targetDate, color, isEmergencyFund } = req.body;

        // If it's an emergency fund, check if one already exists
        if (isEmergencyFund) {
            const existing = await Goal.findOne({ user: req.user.id, isEmergencyFund: true });
            if (existing) {
                return res.status(400).json({ message: 'Emergency fund already exists' });
            }
        }

        const newGoal = new Goal({
            name,
            targetAmount,
            currentAmount: 0,
            targetDate,
            color: color || 'bg-indigo-500',
            isEmergencyFund: isEmergencyFund || false,
            user: req.user.id
        });

        const goal = await newGoal.save();
        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update goal progress
router.put('/:id', auth, async (req, res) => {
    try {
        const { currentAmount } = req.body;
        let goal = await Goal.findById(req.params.id);

        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        if (goal.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        const added = currentAmount - goal.currentAmount;
        console.log(`Updating goal ${goal.name}: prev=${goal.currentAmount}, next=${currentAmount}, diff=${added}`);
        if (added > 0) {
            goal.history.push({ amount: added, date: new Date() });
            console.log('History entry added');
        }

        goal.currentAmount = currentAmount;
        await goal.save();
        res.json(goal);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        if (goal.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

        await goal.deleteOne();
        res.json({ message: 'Goal removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
