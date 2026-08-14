const mongoose = require('mongoose');

const studyLogSchema = new mongoose.Schema({
    study: {
        type: Number,
        required: true
    },
    sleep: {
        type: Number,
        required: true
    },
    breaks: {
        type: Number,
        required: true
    },
    stress: {
        type: Number,
        required: true
    },
    burnout: {
        type: String,
        required: true
    },
    productivity: {
        type: Number,
        required: true
    },
    recommendation: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyLog', studyLogSchema);
