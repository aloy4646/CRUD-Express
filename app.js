const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const morgan = require('morgan')

const bodyParser = require('body-parser')

//menambahkan module method-override untuk membantu mengubah request saat update dan delete
//request diubah karena html tidak memiliki method put dan delete
const methodOverride = require('method-override')

//fungsi yang berkaitan dengan fs dan validator dipisah ke controller
const controller = require('./controller.js')

const app = express()

// set view engine memakai ejs
app.set('view engine', 'ejs')

// set layout menggunakan express-ejs-layout dan menentukan tempat template.js berada
app.use(expressLayouts)
app.set('layout', 'layout/template.ejs')

app.use(methodOverride('_method'))
app.use(morgan("dev"))

// menggunakan middleware body-parser untuk mengirimkan input dari Form dan dipanggil menggunakan req.body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))


//index
app.get('/', (req, res) => {
    res.render('index', 
    {
        name:'Jon', 
        title:'NodeJS Web Server'
    })
})

//about
app.get('/about', (req, res) => {
    res.render('about', 
    {
        title: "About",
        imagePath: "images/roma_love.png"
    })
})

//Form
app.post('/contact/form', (req, res) => {
    //jika edit contact maka akan ada oldName yang dapat diquery
    const oldName = req.query.oldName
    var request = "POST"
    var contact = null

    //jika oldName ada maka akan dilakukan Update, jika tidak ada maka dilakukan Create dan tetap undefined
    //contact.name diisi null agar New Name pada form tidak muncul
    if(oldName){
        contact = controller.getContact(oldName)
        request = "PUT"
    }

    //pesan error dipakai untuk menampilkan pop-up error, namun disini akan dikosongkan
    //app.post('/contact/form'... hanya dipanggil saat form pertama kali dipanggil saja
    //jika ada error pada pengisian form nantinya, maka masing-masing route (put dan post) akan merender form.ejs secara langsung
    res.render('form',
    {
        title: "Form Contact",
        oldName,
        contact,
        request,
        pesanError:""
    })
})

//Create Contact
app.post('/contact', (req, res) => {
    const newContact = {"name": req.body.name, "mobile": req.body.mobile, "email": req.body.email}
    const contacts = controller.getContacts()

    //validasi, jika ada error langsung redirect ke error page
    //validasi akan mereturn array berisi error jika ada
    var pesanError = controller.validasi(newContact, contacts)

    if(pesanError.length > 0){
        //mengubah array kedalam bentuk string
        var stringPesanError = ""
        pesanError.forEach(error => {
            console.log(error)
            stringPesanError += error + ", "
        })

        res.render('form',
        {
            title: "Form Contact",
            oldName:null,
            contact:newContact,
            request: "POST",
            pesanError:stringPesanError
        })
        return
    }

    contacts.push(newContact)
    controller.saveContact(contacts)

    res.render('submit',
    {
        title: "Submit",
        newContact,
        request: "POST"
    })
})

//Read List Contact
app.get('/contact', (req, res) => {
    const contacts = controller.getContacts()
    res.render('contact', 
    {
        title: "Contact", 
        contacts
    })
})

//Read Detail Contact
app.get('/contact/:name', (req, res) => {
    const contact = controller.getContact(req.params.name)

    res.render('detailContact', 
    {
        title: "Detail Contact",
        contact
    })
})

//Update Contact
app.put('/contact', (req, res) => {
    const oldContact = controller.getContact(req.body.oldName)
    const newContact = {"name": req.body.name, "mobile": req.body.mobile, "email": req.body.email}

    //delete terlebih dahulu karena ada kemungkinan nama tidak berubah
    //jika nama tidak berubah dan contact tidak didelete terlebih dahulu maka akan terjadi error saat validasi nama
    const newContacts = controller.deleteContact(oldContact, res)

    //validasi, jika ada error langsung redirect ke error page
    var pesanError = controller.validasi(newContact, newContacts)

    if(pesanError.length > 0){
        var stringPesanError = ""
        pesanError.forEach(error => {
            console.log(error)
            stringPesanError += error + ", "
        })

        res.render('form',
        {
            title: "Form Contact",
            oldName: oldContact.name,
            contact:newContact,
            request: "PUT",
            pesanError:stringPesanError
        })
        return
    }

    //Jika new name tidak di isi maka akan diisi dengan old name
    if(!newContact.name) newContact.name = oldContact.name
    newContacts.push(newContact)
    controller.saveContact(newContacts)

    res.render('submit',
    {
        title: "Submit",
        newContact,
        request: "PUT"
    })
})

//Delete Contact
app.delete('/contact/:name', (req, res) => {
    const contactToRemove = controller.getContact(req.params.name)

    const newContacts = controller.deleteContact(contactToRemove)

    controller.saveContact(newContacts)

    res.render('deleteContact', 
    {
        title: "Delete Contact",
        name: req.params.name,
        berhasil:true
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('page not found : 404')
})

app.listen(3000)

