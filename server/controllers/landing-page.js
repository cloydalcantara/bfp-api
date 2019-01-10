const JWT = require('jsonwebtoken');
const Model = require('../models/landing-page');
const { JWT_SECRET } = require('../configuration');


const LearningStrand = require('../models/learningStrand');
const User = require('../models/user');

module.exports = {
  add: async (req, res, next) => {
    
    let postData = {
        active: req.body.active,
        pageDescription: req.body.pageDescription,
        tungkolSaProgramaDescription: req.body.tungkolSaProgramaDescription,
        email: req.body.email,
        contact: req.body.contact,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        medium: req.body.medium,
        google: req.body.google,

        logo: req.files.logo ? req.files.logo[0].filename : null,
        pageLogo: req.files.pageLogo ? req.files.pageLogo[0].filename : null,
        tungkolSaProgramaLogo: req.files.tungkolSaProgramaLogo ? req.files.tungkolSaProgramaLogo[0].filename : null,
    }
    if(req.body.active){
        let active = await Model.findOne({active: {$eq: true}}).exec()
        console.log(active)
        if(active){
            active.active = false
            const activeUpdate = await Model.findOneAndUpdate({_id:active._id},{$set:active}).exec()
        }
    }


    const data = new Model(postData)
    const save = await data.save() 
    
    res.json({ data: save });
  },
  fetchAll: async (req, res, next) => {
    const count = await Model.find({}).count().exec()
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
  fetchSingle: async (req, res, next) => {
    const find = await Model.findOne({_id:req.params.id}).exec()
    res.json({data: find})
  },
  delete: async (req, res, next) => {
    const remove = await Model.remove({_id:req.params.id}).exec()
    res.json({message: "Deleted!"})
  },
  setActive: async (req, res, next) => {
    const data = req.body

    let active = await Model.findOne({active: {$eq: true}}).exec()
    active.active = false
    const activeUpdate = await Model.findOneAndUpdate({_id:active._id},{$set:active}).exec()
    
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    

    res.json({data: update})
  },
  fetchActive: async (req, res, next) => {
    let landingPage = await Model.findOne({active: {$eq: true}}).exec()
    let learningStrand = await LearningStrand.find({}).populate({path:"level"}).sort([['level', -1]]).exec()
    let teacher = await User.find({"local.userType": "Teacher"}).exec()
    let userLength = await User.find({}).count().exec()

    res.json({landingPage: landingPage, learningStrand: learningStrand, teacher: teacher, userLength: userLength})

  },
  update: async (req, res, next) => {
    let updateData = {
        active: req.body.active,
        pageDescription: req.body.pageDescription,
        tungkolSaProgramaDescription: req.body.tungkolSaProgramaDescription,
        email: req.body.email,
        contact: req.body.contact,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        medium: req.body.medium,
        google: req.body.google,

        logo: req.files.logo ? req.files.logo[0].filename : null,
        pageLogo: req.files.pageLogo ? req.files.pageLogo[0].filename : null,
        tungkolSaProgramaLogo: req.files.tungkolSaProgramaLogo ? req.files.tungkolSaProgramaLogo[0].filename : null,

    }
    if(req.body.active){
        let active = await Model.findOne({active: {$eq: true}}).exec()
        console.log(active)
        if(active){
            active.active = false
            const activeUpdate = await Model.findOneAndUpdate({_id:active._id},{$set:active}).exec()
        }
    }
    const data = updateData
    const update = await Model.findOneAndUpdate({_id:req.params.id},{$set:data}).exec()
    res.json({data: update})
  }
}