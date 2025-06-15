const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'essay'],
        required: true
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 1
    }
});

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
        required: true,
        min: 1
    },
    subject: {
        type: String,
        required: false
    },
    questions: [questionSchema],
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

examSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Exam', examSchema); 