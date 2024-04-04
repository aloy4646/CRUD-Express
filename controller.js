const validator = require('validator')
const fs = require("fs");

//membuat folder data jika belum ada
const dirPath = './data'
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath)
}

//membuat file contacts.json jika belum ada
const dataPath = dirPath + "/contacts.json"
if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath, '[]', 'utf-8')
}

const deleteContact = (contactToRemove, res) => {
    const contacts = getContacts()

    const newContacts = contacts.filter(contact => contact.name !== contactToRemove.name)
    if(contacts.length === newContacts.length){
        //delete gagal, maka redirect ke page delete dengan keterangan gagal
        res.render('deleteContact', 
        {
            title: "Delete Contact",
            name: req.params.name,
            berhasil:false
        })
        return contacts
    }else{
        return newContacts
    }
}

const validasi = (newContact, contacts) => {
    pesanError = []

    if(newContact.name && contacts.find(contact => contact.name.toLowerCase() === newContact.name.toLowerCase())){
        pesanError.push("Nama sudah ada dan tidak dapat digunakan")
    }

    if(newContact.email && !validator.isEmail(newContact.email)){
        pesanError.push("Format email tidak sesuai")
    }

    if(!validator.isMobilePhone(newContact.mobile, "id-ID")){
        pesanError.push("Format nomor handphone tidak sesuai")
    }

    return pesanError
}

const getContact = (name) => {

    const contacts = getContacts()
    //pencarian contact tanpa case sensitive
    var contact = contacts.find(currentContact => currentContact.name.toLowerCase() === name.toLowerCase())

    if(contact) return contact
    else null
}

const getContacts = () => {
    const file = fs.readFileSync(dataPath, 'utf-8')
    const contacts = JSON.parse(file)
    return contacts
}

const saveContact = (newContacts) => {
    fs.writeFileSync(dataPath, JSON.stringify(newContacts))
}

module.exports = {deleteContact,
                validasi,
                getContact,
                getContacts,
                saveContact}; 