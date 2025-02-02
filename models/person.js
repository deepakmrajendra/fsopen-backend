const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

require('dotenv').config()            // Load environment variables from .env file. This is needed for next line of code to work
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: (v) => /^\d{2,3}-\d+$/.test(v), // Regex for validating the phone number format
      message: (props) => `${props.value} is not a valid phone number! Use format XX-XXXXXXX or XXX-XXXXXXXX`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)