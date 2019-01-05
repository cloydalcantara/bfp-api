const JWT = require('jsonwebtoken');
const Model = require('../models/exam-management');
const ExamType = require('../models/exam-type-management')
const User = require('../models/user')
const GeneratedExam = require('../models/generated-exam')
const Result = require('../models/examination-result')
const { JWT_SECRET } = require('../configuration');
const csvtojson = require('csvtojson')
const rquery = require('mongoose-query-random')
module.exports = {
  add: async (req, res, next) => {
    let addData = {
      level: req.body.level,
      learningStrand: req.body.learningStrand,
      uploader: req.body.uploader,
      validation: req.body.validation,
       question:{
        details: req.body.questionDetails,
        images: req.files.questionImage ? req.files.questionImage[0].filename : null,
        choices:{
          a:{
            image: req.files.aImage ? req.files.aImage[0].filename : null,
            details: req.body.aDetails
          },
          b:{
            image: req.files.bImage ? req.files.bImage[0].filename : null,
            details: req.body.bDetails
          },
          c:{
            image: req.files.cImage ? req.files.cImage[0].filename : null,
            details: req.body.cDetails
          },
          d:{
            image: req.files.dImage ? req.files.dImage[0].filename : null,
            details: req.body.dDetails
          },
          
        },
        answer: req.body.answer,
        difficulty: req.body.difficulty
      },
      
    }

    if(req.body.learningStrandSub){
      data.learningStrandSub = req.body.learningStrandSub
    }

    const data = new Model(addData)
    const save = await data.save() 
    
    res.json({ data: save });
  },
  fetchAll: async (req, res, next) => {
    let findQuery = {}
    if(req.query){
      let query = req.query
      if(query.uploader){
        findQuery = {...findQuery, uploader: query.uploader}
      }
      if(query.disclude){
        findQuery = {...findQuery, uploader: { $ne: query.disclude } }
      }
      if(query.validation){
        findQuery = {...findQuery, validation: query.validation }
      }
      if(query.learningStrand){
        findQuery = {...findQuery, learningStrand: query.learningStrand }
      }
      if(query.learningStrandSub){
        findQuery = {...findQuery, learningStrandSub: query.learningStrandSub }
      }
      if(query.level){
        findQuery = {...findQuery, level: query.level }
      }
    }

    
    const count = await Model.find(findQuery).populate([{path:"level"},{path:"learningStrand"},{path:"learningStrandSub"},{path:"uploader"},{path:"validator.user"}]).count().exec()
    const pageCount = Math.ceil(count / 10)
    const skip = (parseInt(req.query.page) - 1) * 10
    const find = await Model.find(findQuery).populate([{path:"level"},{path:"learningStrand"},{path:"learningStrandSub"},{path:"uploader"},{path:"validator.user"}]).skip(skip).limit(10).exec()
      res.json({
        data: find,
        currentPage: parseInt(req.query.page),
        previousPage: (parseInt(req.query.page) - 1 <= 0 ? null : parseInt(req.query.page) - 1),
        nextPage: (parseInt(count) > 10 && parseInt(req.query.page) != pageCount ? parseInt(req.query.page) + 1 : null ),
        perPage: 10,
        pageCount: pageCount,
        totalCount: count
    })
  },
  fetchSingle: async (req, res, next) => {
    const find = await Model.findOne({_id:req.params.id}).populate([{path:"level"},{path:"learningStrand"},{path:"learningStrandSub"},{path:"uploader"},{path:"validator.user"}]).exec()
    res.json({data: find})
  },
  delete: async (req, res, next) => {
    const remove = await Model.remove({_id:req.params.id}).exec()
    res.json({message: "Deleted!"})
  },
  update: async (req, res, next) => {
    let updateData = {
      level: req.body.level,
      learningStrand: req.body.learningStrand,
      uploader: req.body.uploader,
      validation: req.body.validation,
       question:{
        details: req.body.questionDetails,
        images: req.files.questionImage ? req.files.questionImage[0].filename : req.body.questionImageText,
        choices:{
          a:{
            image: req.files.aImage ? req.files.aImage[0].filename : req.body.aImageText,
            details: req.body.aDetails
          },
          b:{
            image: req.files.bImage ? req.files.bImage[0].filename : req.body.bImageText,
            details: req.body.bDetails
          },
          c:{
            image: req.files.cImage ? req.files.cImage[0].filename : req.body.cImageText,
            details: req.body.cDetails
          },
          d:{
            image: req.files.dImage ? req.files.dImage[0].filename : req.body.dImageText,
            details: req.body.dDetails
          },
          
        },
        answer: req.body.answer,
        difficulty: req.body.difficulty
      }
    }

    if(req.body.learningStrandSub){
      updateData.learningStrandSub = req.body.learningStrandSub
    }

    const data = updateData
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    res.json({data: update})
  },
  validate: async (req, res, next) => {
    const data = {
      validator: req.body.validator,
      validation: req.body.validation
    }
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    res.json({data: update})
  },
  //for PRE - TEST
  fetchExam: async( req, res, next ) => {
    // const fetchExamType = await ExamType.findOne({_id: req.query.examId}).populate({path:"level"}).exec()

    const checkexamResult = await GeneratedExam.find({ examiner:req.query.examinerId, status: 'Completed', type: req.query.type, }).exec()

    const examResult = await GeneratedExam.find({ examiner:req.query.examinerId, status: 'Retake', type: req.query.type}).exec()

    const fetchExamType = await ExamType.findOne({ _id: req.query.examId}).populate({path:"level"}).exec()


    const adaptiveExamType = await ExamType.find({ level: req.query.level, examType: 'Adaptive Test'}).populate({path:"level"}).exec()
    
    const checkIfAdaptiveTestHasPassed = await GeneratedExam.find({ examiner:req.query.examinerId, status: 'Completed', examType: adaptiveExamType[0]._id }).exec()
    
    let learningStrandId = []

    if(req.query.type === 'Post Test' && checkIfAdaptiveTestHasPassed.length === 0){
      res.json({ status: 'Take Adaptive Test' })
    }

    if(checkexamResult.length == 1){
      res.json({status: 'Passed'})
    }
    
    if(examResult.length > 0){//retake
      //fetch learningStrandId from generatedExam.percentagePerLearningStrand
      let failedLearningStrand = examResult[examResult.length - 1].percentagePerLearningStrand.filter((attr)=>{
        return attr.percentage < 90
      })
      failedLearningStrand.map((attr)=>{
        learningStrandId = [...learningStrandId, attr.learningStrand]
      })
    }else{//new exam
      fetchExamType.learningStrandQuestions.map((attr)=>{
        learningStrandId = [...learningStrandId, attr.learningStrand]
      })
    }
    await Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{$eq:"Easy" } }).random(fetchExamType.easy, true, function(err, data) {
      if (err) throw err;
      const easy = data
      Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{ $eq:"Medium" } }).random(fetchExamType.medium,true, function(err, data){
        if (err) throw err;
        const medium = data
        Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{ $eq:"Hard" } }).random(fetchExamType.hard, true, function(err, data){
          if (err) throw err;
          const hard = data
          res.json({easy: easy, medium: medium, hard:hard, examType:fetchExamType, status: 'Taking'})
        })
      })
    });
  },
  fetchPreTest: async ( req, res, next ) => {
    await ExamType.find({examType: {$eq: 'Pre Test'}}).populate({path:"level"}).random(1, true, function(err, data) {
      if (err) throw err;
      let fetchExamType = data[0]
      let learningStrandId = []
      fetchExamType.learningStrandQuestions.map((attr)=>{
        learningStrandId = [...learningStrandId, attr.learningStrand]
      })
      console.log(learningStrandId)
   
      Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{$eq:"Easy" } }).random(fetchExamType.easy, true, function(err, data) {
        if (err) throw err;
        const easy = data
        Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{ $eq:"Medium" } }).random(fetchExamType.medium,true, function(err, data){
          if (err) throw err;
          const medium = data
          Model.find({ "level": {$eq: fetchExamType.level}, validation: {$eq: true}, learningStrand: {$in: [...learningStrandId]}, "question.difficulty":{ $eq:"Hard" } }).random(fetchExamType.hard, true, function(err, data){
            if (err) throw err;
            const hard = data
            res.json({easy: easy, medium: medium, hard:hard, examType:fetchExamType})
          })
        })
      });
    })
  },
  fetchExerciseExam: async( req, res, next ) => {
    await Model.find({ learningStrand:req.params.learningStrand }).random(1, true, function(err, data){
      if (err) throw err;
      res.json({ data: data });
    })
  },
  fetchDifficultyCount: async( req, res, next ) => {
    const easy = await Model.find({ "question.difficulty":{ $eq:"Easy" }, validation: {$eq: true} }).count().exec()
    const medium = await Model.find({ "question.difficulty":{ $eq:"Medium" }, validation: {$eq: true} }).count().exec()
    const hard = await Model.find({ "question.difficulty":{ $eq:"Hard" }, validation: {$eq: true} }).count().exec()

    res.json({easy: easy, medium: medium, hard: hard})
  },
  upload: async( req, res, next ) => {
    await csvtojson()
      .fromFile("csv/"+req.file.filename)
      .then((jsonObj)=>{
        
        jsonObj.forEach(element => {
          let data = {
            level : req.body.level,
            learningStrand : req.body.learningStrand,
            learningStrandSub: req.body.learningStrandSub,
            uploader: req.body.uploader,
            validation: req.body.validation,
            question:{
              details : element.Details,
              choices:{
                a:{
                  details: element['A Details']
                },
                b:{
                  details: element['B Details']
                },
                c:{
                  details: element['C Details']
                },
                d:{
                  details: element['D Details']
                }
              },
              answer: element.Answer,
              difficulty: element.Difficulty
            }
          }
          const finalData = new Model(data)
          const insert = finalData.save()
        });

        res.json({data:"Inserted!"})
      })
  }
}