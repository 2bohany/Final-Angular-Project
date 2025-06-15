const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const { auth, checkRole } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

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
    console.log('Incoming profile update request body:', req.body);
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password', 'bio', 'profileImage', 'backgroundImage'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        for (let update of updates) {
            if (update === 'profileImage' && req.body.profileImage && req.body.profileImage.startsWith('data:image/')) {
                const base64Data = req.body.profileImage.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const fileExtension = req.body.profileImage.split(';')[0].split('/')[1];
                const fileName = `profile-${req.user._id}-${Date.now()}.${fileExtension}`;
                console.log('Backend: Generated profile fileExtension:', fileExtension);
                console.log('Backend: Generated profile fileName:', fileName);
                const uploadDir = path.join(__dirname, '../uploads/profile-pictures');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, fileName), imageBuffer);
                req.user.profileImage = `/uploads/profile-pictures/${fileName}`;
            } else if (update === 'backgroundImage' && req.body.backgroundImage && req.body.backgroundImage.startsWith('data:image/')) {
                const base64Data = req.body.backgroundImage.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const fileExtension = req.body.backgroundImage.split(';')[0].split('/')[1];
                const fileName = `background-${req.user._id}-${Date.now()}.${fileExtension}`;
                console.log('Backend: Generated background fileExtension:', fileExtension);
                console.log('Backend: Generated background fileName:', fileName);
                const uploadDir = path.join(__dirname, '../uploads/background-pictures');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, fileName), imageBuffer);
                req.user.backgroundImage = `/uploads/background-pictures/${fileName}`;
            } else if (update === 'password') {
                // Hash new password if provided
                const salt = await bcrypt.genSalt(10);
                req.user.password = await bcrypt.hash(req.body.password, salt);
            } else {
                req.user[update] = req.body[update];
            }
        }

        await req.user.save();
        console.log('User object after save (includes image paths):', req.user);

        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                bio: req.user.bio,
                profileImage: req.user.profileImage,
                backgroundImage: req.user.backgroundImage
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Get student dashboard stats
router.get('/dashboard/stats', auth, checkRole(['student']), async (req, res) => {
    try {
        const results = await ExamResult.find({ studentId: req.user._id });
        const totalExamsInDb = await Exam.countDocuments({});
        console.log('Backend: Count of all exams in DB:', totalExamsInDb);

        const stats = {
            totalExams: totalExamsInDb,
            passedExams: results.filter(r => (r.score / r.totalPoints) >= 0.6).length,
            failedExams: results.filter(r => (r.score / r.totalPoints) < 0.6).length,
            averageScore: results.length > 0
                ? (results.reduce((sum, r) => sum + (r.score / r.totalPoints), 0) / results.length) * 100
                : 0
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get teacher dashboard stats
router.get('/dashboard/teacher-stats', auth, checkRole(['teacher']), async (req, res) => {
    console.log('Attempting to fetch teacher dashboard stats from backend.');
    try {
        const results = await ExamResult.find()
            .populate({
                path: 'examId',
                match: { teacherId: req.user._id }
            });

        const filteredResults = results.filter(r => r.examId);

        // Fetch total number of students
        const totalStudents = await User.countDocuments({ role: 'student' });

        const stats = {
            totalExams: filteredResults.length,
            activeExams: filteredResults.filter(r => r.examId.isActive).length, // Ensure active exams count is accurate
            totalStudents: totalStudents,
            averageScore: filteredResults.length > 0
                ? (filteredResults.reduce((sum, r) => sum + (r.score / r.totalPoints), 0) / filteredResults.length) * 100
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
        // Filter out results where examId might be null if the associated exam was deleted
        const filteredExamResults = examResults.filter(result => result.examId !== null);
        console.log('Exam Results after population for Line Chart:', filteredExamResults);
        console.log('Detailed populated examId structures:', filteredExamResults.map(r => r.examId));
        res.json(filteredExamResults);
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

// Get all student exam results for reporting (Teacher view)
router.get('/all-exam-results', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const allExamResults = await ExamResult.find()
            .populate({
                path: 'examId',
                match: { teacherId: req.user._id }
            })
            .populate('studentId', 'name email'); // Populate student name and email

        const filteredResults = allExamResults.filter(result => result.examId !== null);

        const studentPerformanceMap = new Map();

        filteredResults.forEach(result => {
            const studentId = result.studentId._id.toString();
            if (!studentPerformanceMap.has(studentId)) {
                studentPerformanceMap.set(studentId, {
                    studentId: result.studentId._id,
                    studentName: result.studentId.name,
                    email: result.studentId.email,
                    examsTaken: [],
                    averageScore: 0
                });
            }
            const studentData = studentPerformanceMap.get(studentId);
            studentData.examsTaken.push({
                examId: result.examId._id,
                examTitle: result.examId.title,
                score: result.score,
                totalPoints: result.totalPoints,
                completedAt: result.completedAt,
                status: (result.score / result.totalPoints) >= 0.6 ? 'passed' : 'failed'
            });
        });

        const finalStudentPerformances = Array.from(studentPerformanceMap.values()).map(student => {
            const totalScores = student.examsTaken.reduce((sum, exam) => sum + (exam.score / exam.totalPoints), 0);
            student.averageScore = student.examsTaken.length > 0 ? (totalScores / student.examsTaken.length) * 100 : 0;
            return student;
        });

        console.log('Backend sending final student performances:', finalStudentPerformances);
        res.json(finalStudentPerformances);
    } catch (error) {
        console.error('Error fetching all student exam results:', error);
        res.status(500).json({ message: 'Error fetching all student exam results' });
    }
});

// Get all students (Teacher view)
router.get('/students', auth, checkRole(['teacher']), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

module.exports = router; 