const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Create a schema
const generatedExamSchema = new Schema({
  learningStrand: {
    type: Schema.Types.ObjectId,
    ref: 'learningStrand'
  },
  examType: {
    type: Schema.Types.ObjectId,
    ref: 'examType'
  },
  exam: [],
  examiner: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  dateStarted: {
    type: Date
  },
  status: String, //completed, pending,
  timeRemaining: String, //if not completed,
  score: {
    points: Number,
    dateFinished: Date
  }
});

// Create a model
const GeneratedExam = mongoose.model('generatedExam', generatedExamSchema);
generatedExamSchema.pre('save', async function(next) {
  try {
    this.dateStarted = Date.now;
    next();
  } catch(error) {
    next(error);
  }
});
// Export the model
module.exports = GeneratedExam;