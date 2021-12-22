const reportController = {};
const fs = require('fs');
const {parse} = require('csv-parse');
const _ = require('lodash');
const Report = require('../models/Report');
const User = require('../models/User');
const Employee = require('../models/Employee');
const assert = require('assert');
const { updateOne } = require('../models/User');
const dateChecker = '/js/dateChecker.js';

reportController.renderNewReport = (req,res) =>{
    res.render('reports/newReport',{dateChecker});
}

const getDelta = (x,y) =>{
    let time1 = x.split(':');
    let time2 = y.split(':');
    let sumaHoras = parseInt(time1[0]-time2[0]);
    let sumaMins =  parseInt(time1[1]-time2[1]);
    return((sumaHoras*3600+sumaMins * 60)/3600);
}

reportController.formatData = async (req,res,next) =>{
    const input = req.file.buffer.toString();
    const raw =  input.split('|')
    const objects = [];
    for(let i = 0;i<raw.length;i++){
        raw[i] = raw[i].split('\n')
    }
    for(let i = 0;i<raw.length;i++){
        for(let j = 0;j<raw[i].length;j++){
            raw[i][j] = raw[i][j].split(',');
        }
    }
    
    let initDay = raw[0][0][0].split('/')
    let finalDay = raw[0][0][1].split('/')
    let initDate = new Date(initDay[2],initDay[1]-1,initDay[0])
    let finalDate = new Date(finalDay[2],finalDay[1]-1,finalDay[0])
    let dates = []
    let delta = (finalDate - initDate)/(24 * 60 * 60 * 1000)+1;
    for(let i= 0;i<delta;i++){
        dates.push(new Date(initDate))
        initDate.setTime(initDate.getTime() + (24 * 60 * 60 * 1000))
    }

    let totalDia = 0;

    for(let row = 1;row<raw.length;row++){
        objects.push([raw[row][0][0],raw[row][0][1],[]]);
        let tomorrow = new Date(initDate);
        
        for(let col = 1;col<raw[row].length;col++){
            totalDia = 0;

            for(let tstamp = 1; tstamp<raw[row][col].length;tstamp+=2){
                totalDia+=getDelta(raw[row][col][tstamp],raw[row][col][tstamp-1]);
            }
            objects[row-1][2].push([dates[col-1],totalDia]);
        }
    }
    let data = [];
    objects.forEach(element => {
        data = [
            ...data,
            {name:element[0],
            personalId:element[1],
            companyId:req.user.id,
            workedDays:element[2]},
        ]
    });  
    req.data = data;
    return (next());
}

reportController.newReport = async (req,res) =>{
    const {data} = req;
    const employees = await Employee.find({companyId:req.user.id});
    employees.forEach(element => {
        if(data.some(item => item.personalId === element.personalId)){
            let indexNum = data.findIndex(x=>x.personalId === element.personalId);
            //creamos un array conjunto de ambos elementos 
            data[indexNum].workedDays = [...element.workedDays,...data[indexNum].workedDays];
            //eliminamos cualquier duplicado literal
            data[indexNum].workedDays = _.uniqWith(data[indexNum].workedDays,_.isEqual);
            //eliminamos cualquier duplicado especificamente por su fecha manteniendo los registros 'originales'
            data[indexNum].workedDays = _.uniqBy(data[indexNum].workedDays,function(item){
                return JSON.stringify(item[0]);
            });
        }
    });

    let send = []
    for(prod of data){
        send = [
            ...send,
            {
                updateOne:{
                    filter: { personalId:prod.personalId },
                    update: { 
                        name: prod.name,
                        companyId: prod.companyId,
                        personalId: prod.personalId,
                        workedDays: prod.workedDays
                    },
                    upsert: true
                }
            }
        ]
    }
    await Employee.bulkWrite(send,function(error,docs){if(error)console.log(error);});
    res.redirect('/dashboard');
}

reportController.processSearchReq = async (req,res) =>{
    let {startDate,endDate} = req.query;
    let hourValue = 17;//in USD$
    let totalHours = 0,
    totalHourValue = 0,
    totalOvertime=0,
    totalOvertimeValue =0,
    totalRegular=0,
    totalRegularValue =0,
    totalTax=0,
    totalPay=0;
    
    if(startDate === ''){
        startDate = new Date('1800-01-01');
    }
    if(endDate === ''){
        endDate = new Date('5800-01-01');
    }
    let filteredEmployees=[];
    let entries;
    entries = await Employee.find({companyId:req.user.id}).lean();
    let startDate2 = new Date(startDate);
    let endDate2 = new Date(endDate);
    startDate2.setDate(startDate2.getDate()+1);
    endDate2.setDate(endDate2.getDate());
    
    for (entrie of entries){
        let filteredDays=[];
        daysWorked = entrie.workedDays;
        for(day of daysWorked){
            let extraTime = 0;
            let xtv = 0;
            let eth = 0;
            let etv = 0;
            if(day[0] >= startDate2 && day[0]<=endDate2){
                if(day[1]>8){
                    extraTime = day[1]-8;
                    xtv = Math.round(extraTime * (hourValue*1.5) * 10) / 10;
                    eth =day[1]-extraTime;
                    etv =eth * hourValue;
                    extraTime = Math.round(extraTime*10)/10;
                    filteredDays.push({...day,'1':eth,'2':etv,'8': extraTime,'9':xtv});
                }else{
                    eth =day[1];
                    etv =eth * hourValue;
                    filteredDays.push({...day,'1':eth,'2':etv});
                }
            }
        }
        
        if(filteredDays.length !=0){
            for(day of filteredDays){
                day[0] = day[0].toDateString();
            }
            filteredEmployees.push({name:entrie.name,id:entrie.personalId,days:filteredDays})
        }

    }

    filteredEmployees.forEach(element => {
        element.days.sort(function(a,b){
            return new Date(a[0]) - new Date(b[0])
        })

        let localT = 0,
        localTV = 0,
        localR = 0,
        localRV = 0;
        localO = 0,
        localOV = 0;
        for(day of element.days){
            if(day[8]){
                localO += day[8];
                localOV += day[9];
            }
            localR += day[1];
            localRV += day[2];
        }
        
        localT = localO + localR;
        localTV = localOV + localRV;
        
        totalOvertime += localO;
        totalOvertimeValue += localOV;
        totalRegular += localR;
        totalRegularValue += localRV;
        
        element.localT = localT;
        element.localTV = localTV;
        element.localR = localR;
        element.localRV = localRV;
        element.localO = localO;
        element.localOV = localOV;

        discount = Math.round(localTV * 0.17);
        element.dsc = discount;

        payment = Math.round(localTV - discount);
        element.pay = payment; 

        totalPay +=payment;
        totalTax +=discount;
    });
    totalHours = totalRegular + totalOvertime;
    totalHourValue = totalRegularValue + totalOvertimeValue;
    startDate2.setDate(startDate2.getDate()+1);

    let data = {
        totalPay,totalOvertime,totalOvertimeValue,
        totalRegular,totalRegularValue,totalHours,
        totalHourValue,totalTax,filteredEmployees,
        startDate:startDate2.toDateString(),endDate:endDate2.toDateString()};
    req.session.data = data;
    res.render('reports/reportList',{...data});
}

reportController.listAllReports = async (req,res) =>{
    const reports = await Report.find({companyId:req.user.id}).lean();
    console.log(reports);
    res.render('reports/listAll',{reports});
}

reportController.saveReport = async (req,res) =>{
    const data = req.session.data;
    await Report.create({companyId:req.user.id,...data});
    req.flash('success_msg','Payroll Report Saved!');
    delete req.session.data;
    res.redirect('/dashboard');
}

reportController.viewReport = async (req,res) =>{
    const report = await Report.findById(req.params.id).lean();
    res.render('reports/more',{...report});
}
reportController.deleteReport = async (req,res) =>{
    await Report.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Report Deleted!');
    res.redirect('/reports/list');
}

reportController.renderSelector = (req,res) =>{
    res.render('reports/selectDates',{dateChecker});
}
module.exports = reportController;