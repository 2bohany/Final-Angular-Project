const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answer: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    }],
    score: {
        type: Number,
        required: true,
        min: 0
    },
    totalPoints: {
        type: Number,
        required: true,
        min: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ExamResult', examResultSchema); 