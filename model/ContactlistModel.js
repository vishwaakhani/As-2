
/*

  File name : ContactListModel.js
  Student name :Vishwa Akhani
  StudentID :300913898
  Date:29 October 2020

*/
const mongoose=require('mongoose')
const ContactlistSchema= mongoose.Schema({
    name:String,
    number:String,
    email:String
})
const ContactlistModel=mongoose.model('ContactlistModel',ContactlistSchema)
module.exports=ContactlistModel