const express = require('express')
const app = express()
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

// https://fullstackopen.com/en/part3/deploying_app_to_internet#frontend-production-build
app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

const cors = require('cors')

// By default, app.use(cors()) allows requests from all origins (any domain can make requests to the backend)
app.use(cors())

app.use(express.json())

// // Method 1 of using morgan middleware with 'tiny' configuration
// // The 'tiny' format logs the HTTP method, URL, status code, response time, and the length of the response body in bytes
// app.use(morgan('tiny'))

// Method 2 of using morgan middleware with 'custom token' (i.e., creating new tokens) configuration
// Create a custom token to log POST request body
morgan.token('post-body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

// Configure Morgan to use the custom token in the 'tiny' format
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.get('/info', (request, response, next) => {
  Person
    .countDocuments({})
    .then(count => {
      response.send(`<p>
                        Phonebook has info for ${count} people
                    </p>
                    <p>
                        ${new Date()}
                    </p>`)
    })
    .catch(error => next(error))
})


app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons)
    })
})


app.get('/api/persons/:id', (request, response) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log('Error fetching note:', error)
      response.status(400).send({ error: 'malformatted id' })
    })
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(result => {
      if (!result) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(result)
    })
    .catch(error => next(error))
})

// const generateId = (min, max) => {
//     const minCeiled = Math.ceil(min)
//     const maxFloored = Math.floor(max)
//     // The maximum is inclusive and the minimum is inclusive
//     return String(Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled))
// }

app.post('/api/persons', (request, response, next) => {

  const body = request.body

  // // Error handling: Check if name or number is missing
  // if (!body.name || !body.number) {
  //     return response.status(400).json({ error: 'Name or number are required' })
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person
    .findByIdAndUpdate(
      request.params.id,
      { name, number },
      { new: true , runValidators: true , context: 'query' }
    )
    .then(updatedPerson => {
      if (!updatedPerson) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.use(unknownEndpoint)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

// const PORT = 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})