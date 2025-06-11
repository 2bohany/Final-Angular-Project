const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: String,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema); 