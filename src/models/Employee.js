const {Schema, model} = require('mongoose');

const EmployeeSchema = new Schema({
    personalId: {type: String, required: true},
    companyId: {type:String, required:true},
    name: {type: String, required: true},
    workedDays: {type:Array,default:[]},
});

module.exports = model('Employee', EmployeeSchema, 'employees');