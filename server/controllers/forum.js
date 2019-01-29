const JWT = require('jsonwebtoken');
const Model = require('../models/forum');
const { JWT_SECRET } = require('../configuration');
const AuditTrail = require('../models/auditTrail')

module.exports = {
  add: async (req, res, next) => {
    let postData = {
      forum: req.body.forum,
      description: req.body.description,
      createdBy: req.body.createdBy,
      title: req.body.title,
      datePosted: req.body.datePosted,
      image: req.files.image ? req.files.image[0].filename : null,

    }
    const data = new Model(postData)
    const save = await data.save() 
    if(save){
      const trail = {
        title: "Insert Forum.",
        user: req.query.userId,
        module: "Forum",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: Date.now()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({ data: save });
    }
  },
  fetchAll: async (req, res, next) => {
    const count = await Model.find({}).count().exec()
    const pageCount = Math.ceil(count / 10)
    const skip = (parseInt(req.query.page) - 1) * 10 
    const find = await Model.find({}).populate({path:"createdBy"}).skip(skip).limit(10).exec()
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
    const find = await Model.findOne({_id:req.params.id}).populate({path:"createdBy"}).exec()
    res.json({data: find})
  },
  fetchByManagement: async (req, res, next) => {
    const count =  await Model.find({forum:req.params.id}).count().exec()
    const pageCount = Math.ceil(count / 10)
    const skip = (parseInt(req.query.page) - 1) * 10 
    const find =  await Model.find({forum:req.params.id}).populate({path:"createdBy"}).skip(skip).limit(10).exec()
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
  delete: async (req, res, next) => {
    const remove = await Model.remove({_id:req.params.id}).exec()
    if(remove){
      const trail = {
        title: "Delete Forum.",
        user: req.query.userId,
        module: "Forum",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: Date.now()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({message: "Deleted!"})
    }
  },
  update: async (req, res, next) => {
    let postData = {
      forum: req.body.forum,
      description: req.body.description,
      createdBy: req.body.createdBy,
      title: req.body.title,
      datePosted: req.body.datePosted,
      image: req.files.image ? req.files.image[0].filename : null,
    }
    const data = postData.body
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    if(update){
      const trail = {
        title: "Update Forum.",
        user: req.query.userId,
        module: "Forum",
        validator: req.query.validator,
        contributor: req.query.contributor,
        learner  : req.query.learner,
        date: Date.now()
      }
      const trailData = new AuditTrail(trail)
      await trailData.save()
      res.json({data: update})
    }
  }
}