const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const uuid = require('uuid');
const User = require('../models/user.js');

const InvoiceModel = require('../models/invoice-list.js')
const Company = require('../models/company-list.js')
const GSTRate = require('../models/statewise-gst.js')
const Sequence = require('../models/squence.js')

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const { convertNumberToWords, formatDate, convertCurrencyToWords } = require('../utils/common-function.js');
const MAX_ROWS = 17

handlebars.registerHelper('inc', function(value, options) {
    return parseInt(value) + 1;
});

const createInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let pdfPath
    try {
        const { currency, PODate, PONumber, currentDate, grandTotal, hsn, id, isOpen, items, companyName, companyAddress, companyCity, companyState, companyPincode, companyCountry, companyGSTNumber, cgstPerc, igstPerc, sgstPerc, total, cgst, sgst, igst } = req.body
        const invoiceNumber = await getNextSequence('invoice', session);
        const company = {
            name: companyName,
            address: companyAddress,
            city: companyCity,
            state: companyState,
            country: companyCountry,
            pincode: companyPincode,
            gst: companyGSTNumber
        }
        const companyUpsert = await Company.findOneAndUpdate(company, company, { new: true, upsert: true, session });

        const gst = {
            state: companyState,
            CGST: cgstPerc,
            SGST: sgstPerc,
            IGST: igstPerc
        }
        const gstUpsert = await GSTRate.findOneAndUpdate({state: companyState}, gst, { new: true, upsert: true, session });

        let data = {
            invoiceNumber,
            ...req.body,
            hsn: process.env.hsn,
            debitToDetails: `${companyName}, ${companyAddress}, ${companyCity}, ${companyState}, ${companyCountry}-${companyPincode}`,
            grandTotalInWords: convertNumberToWords(grandTotal),
            PODate: formatDate(PODate),
            PODateFormat:  PODate
        }
        const newInvoice = new InvoiceModel(data);
        const savedInvoice = await newInvoice.save({session});
       
        pdfPath = await generatePDF(data)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(pdfPath)}`);

        await session.commitTransaction();
        session.endSession();
        fs.createReadStream(pdfPath).pipe(res);
    }
    catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        res.status(400).send({ error: 'Some unexpected error occured' })
    }
    finally {
        // setTimeout(() => {
        //     fs.unlinkSync(pdfPath)
        // },5000)
    }
}


async function getNextSequence(name, session) {
    const sequenceDocument = await Sequence.findOneAndUpdate(
        { id: name },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true,
            useFindAndModify: false,
            session
        }
    );
    return sequenceDocument.seq;
}

async function generatePDF(data) {
    if (data && data.items) {
        const items = data.items
        const groupedItems = items.reduce((acc, item) => {

            if (!acc[item.name]) {
                acc[item.name] = [];
            }
            acc[item.name].push({
                id: item.id,
                description: item.description,
                rate: item.rate,
                quantity: item.quantity,
                amount: item.amount
            });
            return acc;
        }, {});
        
        const transformedItems = Object.keys(groupedItems).map(name => ({
            name,
            list: groupedItems[name]
        }));        
       data.items = transformedItems      
    }

    let itemCount = data.items.reduce((count, group) => count + group.list.length, data.items.length);
    const emptyRowsNeeded = MAX_ROWS - itemCount;
    
    if (emptyRowsNeeded > 0) {
        for (let i = 0; i < emptyRowsNeeded; i++) {
            data.items.push({
                name: '',
                list: [{
                    id: '',
                    description: '',
                    rate: '',
                    quantity: '',
                    amount: ''
                }]
            });
        }
    }
    const pathname = path.join(__dirname, '..', 'template', 'template.html');
    const templateSource = fs.readFileSync(pathname, 'utf8');
    const template = handlebars.compile(templateSource);

    const html = template(data);
    const browser = await puppeteer.launch({
        headless : true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            ]
        });
    const page = await browser.newPage();
    await page.setContent(html);
    let filename = __dirname + +'/'+new Date().toDateString()+'invoice.pdf'
    await page.pdf({ 
        path: filename, 
        format: 'A4',
        displayHeaderFooter: true,
        footerTemplate:`<footer style="width: 100%">
        <p style="text-align: center;line-height:normal; font-size:12px">
            <strong>Registered &amp; Communication Address: </strong><span
                style="font-family:'Arial Narrow'">L-15/860,
                Ashiana Aangan, Alwar By Pass Road, Bhiwadi-301019</span>
        </p>
        <p style="text-align:center; line-height:normal; font-size:12px">
            <span style="font-family:'Arial Narrow'">Mobile: 0-9783694136</span><span
                style="font-family:'Arial Narrow'">&#xa0;&#xa0; </span><span
                style="font-family:'Arial Narrow'">,
                E-mail: </span><a href="mailto:zingenterprises.ees@gmail.com"
                style="text-decoration:none"><u><span
                        style="font-family:'Arial Narrow'; color:#0000ff">zingenterprises.ees@gmail.com</span></u></a><span
                style="font-family:'Arial Narrow'"> , </span><a href="mailto:praveen8771@gmail.com"
                style="text-decoration:none"><u><span
                        style="font-family:'Arial Narrow'; color:#0000ff">praveen8771@gmail.com</span></u></a>
        </p>

</footer>
` });

   await browser.close();
    return filename;
}

const getList = async (req, res) => {
    try{
        let [companyList, gstList] = await Promise.all([
            Company.find(), GSTRate.find()
        ])
        return res.status(200).send({ message : 'GetList', data : {companyList, gstList} })
    }
    catch (error) {
        console.log(error)
        res.status(400).send({ error: 'Some unexpected error occured' })
    }
}

const getInvoiceList = async (req, res) => {
    try{
        let invoices = await InvoiceModel.find()
        return res.status(200).send({ message : 'GetList', data : {invoices} })
    }
    catch (error) {
        console.log(error)
        res.status(400).send({ error: 'Some unexpected error occured' })
    }
}

module.exports = {
    createInvoice,
    getList,
    getInvoiceList
}
