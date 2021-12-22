const {Schema, model} = require('mongoose');

const ReportSchema = new Schema({
    companyId: {type:String, required:true},
    startDate: {type: String, required: true},
    endDate: {type: String, required: true},
    totalHours : {type: String,required: true},
    totalHourValue : {type: String,required: true},
    totalOvertime : {type: String,required: true},
    totalOvertimeValue : {type: String,required: true},
    totalRegular : {type: String,required: true},
    totalRegularValue : {type: String,required: true},
    totalTax : {type: String,required: true},
    totalPay : {type: String,required: true},
    filteredEmployees: {type:Array,default:[]},
});

module.exports = model('Report', ReportSchema, 'reports');