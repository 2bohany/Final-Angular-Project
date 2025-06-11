const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
const { auth, checkRole } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get student dashboard stats
router.get('/dashboard/stats', auth, checkRole(['student']), async (req, res) => {
    try {
        const results = await ExamResult.find({ studentId: req.user._id });

        const stats = {
            totalExams: results.length,
            passedExams: results.filter(r => (r.score / r.totalPoints) >= 0.6).length,
            failedExams: results.filter(r => (r.score / r.totalPoints) < 0.6).length,
            averageScore: results.length > 0
                ? results.reduce((sum, r) => sum + (r.score / r.totalPoints), 0) / results.length
                : 0
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get teacher dashboard stats
router.get('/dashboard/teacher-stats', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const results = await ExamResult.find()
            .populate({
                path: 'examId',
                match: { teacherId: req.user._id }
            });

        const filteredResults = results.filter(r => r.examId);

        const stats = {
            totalExams: filteredResults.length,
            passedExams: filteredResults.filter(r => (r.score / r.totalPoints) >= 0.6).length,
            failedExams: filteredResults.filter(r => (r.score / r.totalPoints) < 0.6).length,
            averageScore: filteredResults.length > 0
                ? filteredResults.reduce((sum, r) => sum + (r.score / r.totalPoints), 0) / filteredResults.length
                : 0
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get student exam results
router.get('/profile/exam-results', auth, checkRole(['student']), async (req, res) => {
    try {
        const examResults = await ExamResult.find({ studentId: req.user._id }).populate('examId');
        console.log('Exam Results after population for Line Chart:', examResults);
        res.json(examResults);
    } catch (error) {
        console.error('Error fetching student exam results:', error);
        res.status(500).json({ message: 'Error fetching student exam results' });
    }
});

// Get student subject scores for chart
router.get('/dashboard/subject-scores', auth, checkRole(['student']), async (req, res) => {
    try {
        const examResults = await ExamResult.find({ studentId: req.user._id }).populate('examId');
        console.log('Exam Results for Subject Scores:', examResults);

        const subjectScoresMap = new Map();

        examResults.forEach(result => {
            if (result.examId && result.examId.subject) {
                const subject = result.examId.subject;
                const scorePercentage = (result.score / result.totalPoints) * 100;

                if (!subjectScoresMap.has(subject)) {
                    subjectScoresMap.set(subject, { totalScore: 0, count: 0 });
                }
                const current = subjectScoresMap.get(subject);
                current.totalScore += scorePercentage;
                current.count += 1;
            }
        });

        const subjectScores = Array.from(subjectScoresMap.entries()).map(([subject, data]) => ({
            subject,
            score: data.totalScore / data.count,
            color: '#' + Math.floor(Math.random()*16777215).toString(16) // Generate a random color
        }));

        res.json(subjectScores);
    } catch (error) {
        console.error('Error fetching subject scores:', error);
        res.status(500).json({ message: 'Error fetching subject scores' });
    }
});

module.exports = router; 