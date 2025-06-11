const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const { auth, checkRole } = require('../middleware/auth');

// Get all exams (for teachers)
router.get('/teacher', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const exams = await Exam.find({ teacherId: req.user._id });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams' });
    }
});

// Get all active exams (for students)
router.get('/student', auth, checkRole(['student']), async (req, res) => {
    try {
        const exams = await Exam.find({ isActive: true });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams' });
    }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // If student, check if exam is active
        if (req.user.role === 'student' && !exam.isActive) {
            return res.status(403).json({ message: 'Exam is not active' });
        }

        // If teacher, check if they own the exam
        if (req.user.role === 'teacher' && exam.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam' });
    }
});

// Create exam
router.post('/', auth, checkRole(['teacher']), async (req, res) => {
    try {
        // Ensure the subject is passed in the request body
        if (!req.body.subject) {
            return res.status(400).json({ message: 'Subject is required.' });
        }

        const exam = new Exam({
            ...req.body,
            teacherId: req.user._id
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Error creating exam' });
    }
});

// Update exam
router.put('/:id', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Ensure subject can be updated
        const allowedUpdates = ['title', 'description', 'duration', 'questions', 'isActive', 'subject'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => exam[update] = req.body[update]);
        await exam.save();
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating exam' });
    }
});

// Delete exam
router.delete('/:id', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await exam.remove();
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exam' });
    }
});

// Submit exam
router.post('/:id/submit', auth, checkRole(['student']), async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.isActive) {
            return res.status(403).json({ message: 'Exam is not active' });
        }

        // Calculate score
        let score = 0;
        const answers = req.body.answers;

        for (const question of exam.questions) {
            const answer = answers.find(a => a.questionId === question._id.toString());
            if (answer) {
                if (question.type === 'multiple-choice' || question.type === 'true-false') {
                    if (answer.answer === question.correctAnswer) {
                        score += question.points;
                    }
                }
                // For essay questions, manual grading would be needed
            }
        }

        const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

        const result = new ExamResult({
            examId: exam._id,
            studentId: req.user._id,
            answers,
            score,
            totalPoints
        });

        await result.save();
        res.status(201).json(result);
    } catch (error) {
        console.error('Error submitting exam:', error.stack);
        res.status(500).json({ message: 'Error submitting exam' });
    }
});

// Get exam results
router.get('/:id/results', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // If student, only show their results
        if (req.user.role === 'student') {
            const results = await ExamResult.find({
                examId: exam._id,
                studentId: req.user._id
            });
            return res.json(results);
        }

        // If teacher, check if they own the exam
        if (exam.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const results = await ExamResult.find({ examId: exam._id })
            .populate('studentId', 'name email');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results' });
    }
});

module.exports = router; 