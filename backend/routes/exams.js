const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// Get all exams
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one exam
router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) {
            res.json(exam);
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create exam
router.post('/', async (req, res) => {
    const exam = new Exam({
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        questions: req.body.questions
    });

    try {
        const newExam = await exam.save();
        res.status(201).json(newExam);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update exam
router.patch('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) {
            Object.assign(exam, req.body);
            const updatedExam = await exam.save();
            res.json(updatedExam);
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete exam
router.delete('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (exam) {
            await exam.deleteOne();
            res.json({ message: 'Exam deleted' });
        } else {
            res.status(404).json({ message: 'Exam not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 