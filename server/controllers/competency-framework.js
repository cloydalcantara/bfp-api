const JWT = require('jsonwebtoken');
const Model = require('../models/competency-framework');
const { JWT_SECRET } = require('../configuration');


module.exports = {
  add: async (req, res, next) => {
    console.log(req.body)
    const data = new Model(req.body)
    const save = await data.save() 
    if(save){
      res.json({ data: save });
    }
  },
  fetchAll: async (req, res, next) => {
   
    const count = await Model.find({}).countDocuments().exec()
    const pageCount = Math.ceil(count / 10)
    const skip = (parseInt(req.query.page) - 1) * 10
    const find = await Model.find({}).skip(skip).limit(10).exec()
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
  fetchWithoutPagination: async (req, res, next) => {
    const find = await Model.find({}).exec()
      res.json({
        data: find       
    })
  },
  fetchSingle: async (req, res, next) => {
    const find = await Model.findOne({_id:req.params.id}).exec()
    res.json({data: find})
  },
  fetchType: async (req, res, next) => {
    const core = await Model.find({competency_category:"CORE COMPETENCIES"}).exec()
    const leader = await Model.find({competency_category:"LEADERSHIP COMPETENCIES"}).exec()
    const tech = await Model.find({competency_category:"TECHNICAL COMPETENCIES"}).exec()
    const cross = await Model.find({competency_category:"CROSS CUTTING COMPETENCIES"}).exec()
    res.json({core: core, leadership: leader, technical: tech, cross: cross})
  },
  delete: async (req, res, next) => {
    const remove = await Model.remove({_id:req.params.id}).exec()
    if(remove){
      res.json({message: "Deleted!"})
    }
    
  },
  update: async (req, res, next) => {
    const data = req.body
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    if(update){
      res.json({data: update})
    }
  }
}