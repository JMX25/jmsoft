const { Router } = require('express');
const router = Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { renderNewReport, formatData, newReport, renderSelector, processSearchReq, saveReport, listAllReports, viewReport, deleteReport } = require('../controllers/report.controller');
const { isAuthenticated } = require('../helpers/auth');

router.get('/reports/new',isAuthenticated,renderNewReport);
router.post('/reports/new',isAuthenticated,upload.single("file"),formatData,newReport);
router.get('/reports/select',isAuthenticated,renderSelector);
router.get('/reports/recoverSelection',isAuthenticated,processSearchReq);
router.post('/reports/save',isAuthenticated,saveReport);
router.get('/reports/list',isAuthenticated,listAllReports);

router.get('/reports/view/:id',isAuthenticated,viewReport);
router.delete('/reports/delete/:id',isAuthenticated,deleteReport);

module.exports = router;