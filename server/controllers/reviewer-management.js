const JWT = require('jsonwebtoken');
const Model = require('../models/reviewer-management');
const { JWT_SECRET } = require('../configuration');
const AuditTrail = require('../models/auditTrail')


module.exports = {
  add: async (req, res, next) => {
    let rmData = {
      learningStrand: req.body.learningStrand,
      level: req.body.level,
      description: req.body.description,
      uploader: req.body.uploader,
      validation: req.body.validation,
      fileType: req.body.fileType,
      fileUsage: req.body.fileUsage
    }
    if(req.body.learningStrandSub){
      rmData = { ...rmData, learningStrandSub: req.body.learningStrandSub }
    }
    if(req.body.reviewer){
      rmData = { ...rmData, reviewer: req.body.reviewer }
    }
    if(req.body.validator){
      rmData = { ...rmData, validator: [ { user: req.body.validator} ] }
    }
    if(req.file){
      rmData = {...rmData, pdf: req.file.filename }
    }
    if(req.body.youtubeVideo){
      rmData = { ...rmData, youtubeVideo: req.body.youtubeVideo }
    }

    const data = new Model(rmData)
    const save = await data.save() 
    if(save){
      const trail = {
        title: "Insert Reviewer.",
        user: req.query.userId,
        module: "Reviewer Management",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: new Date()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({ data: save });
    }
  },

   fetchAllWithoutPagination: async (req, res, next) => {

     let findQuery = {
      validation: {$eq: true},
      fileUsage: {$ne: 'Session Guide'},
     }
    if(req.query){
      let query = req.query
    
      if(query.learningStrand){
        findQuery = {...findQuery, learningStrand: query.learningStrand }
      }
      
      
    }
    
    const find = await Model.find(findQuery).populate([{path:"uploader"},{path:"reviewer"},{path:"learningStrand"},{path:"level"},{path:"learningStrandSub"},{path:"validator.user"}]).exec()
      res.json({
        data: find
    })
   
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
      if(query.level){
        findQuery = {...findQuery, level: query.level }
      }
      if(query.fileUsage){
        findQuery = {...findQuery, fileUsage: query.fileUsage }
      }
      if(query.fileType){
        findQuery = {...findQuery, fileType: query.fileType }
      }
    }
    const count = await Model.find(findQuery).count().exec()
    const pageCount = Math.ceil(count / 10)
    const skip = (parseInt(req.query.page) - 1) * 10
    const find = await Model.find(findQuery).populate([{path:"uploader"},{path:"reviewer"},{path:"learningStrand"},{path:"level"},{path:"learningStrandSub"},{path:"validator.user"}]).skip(skip).limit(10).exec()
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
    const find = await Model.findOne({_id:req.params.id}).populate([{path:"uploader"},{path:"learningStrand"},{path:"level"},{path:"learningStrandSub"},{path:"validator.user"}]).exec()
    res.json({data: find})
  },
  delete: async (req, res, next) => {
    const remove = await Model.remove({_id:req.params.id}).exec()
    if(remove){
      const trail = {
        title: "Remove Reviewer.",
        user: req.query.userId,
        module: "Reviewer Management",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: new Date()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({message: "Deleted!"})
    }
  },
  update: async (req, res, next) => {
    const data = { 
      learningStrand: req.body.learningStrand,
      level: req.body.level,
      description: req.body.description,
      uploader: req.body.uploader,
      validator: req.body.validator 
    }
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    if(update){
      const trail = {
        title: "Update Reviewer.",
        user: req.query.userId,
        module: "Reviewer Management",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: new Date()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({data: update})
    }
    
  },
  validate: async (req, res, next) => {
    const data = {
      validator: req.body.validator,
      validation: req.body.validation
    }
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    if(update){
      const trail = {
        title: "Validate Reviewer.",
        user: req.query.userId,
        module: "Reviewer Management",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({data: update})
    }
    
  },
   validateMultiple: async (req, res, next) => {
    const update = await Model.updateMany({_id:{$in:[...req.body.id]}},{$set:{validation: true, validator: req.body.validator }}).exec()
    if(update){
      const trail = {
        title: "Validate Reviewer.",
        user: req.query.userId,
        module: "Reviewer Management",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({data: update})
    }
  },
  getUploadCount: async (req, res, next) => {
    // STATISTICS 
    // Display pie graph
    const uploadsCount = await Model.find({uploader: req.body.id}).countDocuments().exec()
    const validatedCount = await Model.find({uploader: req.body.id,validation: true}).countDocuments().exec()
    res.json({uploadsCount, validatedCount})
  }
}