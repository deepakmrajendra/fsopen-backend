const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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

app.get('/info', (request, response) => {
    response.send(`<p>
                        Phonebook has info for ${persons.length} people 
                   </p> 
                   <p> 
                        ${new Date()} 
                   </p>`)
                
})


app.get('/api/persons', (request, response) => {
  response.json(persons)
})


app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
  
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  
})


app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.json(persons)
    response.status(204).end()
})


const generateId = (min, max) => {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    // The maximum is inclusive and the minimum is inclusive
    return String(Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled))
}
  
app.post('/api/persons', (request, response) => {
  
    const body = request.body
    // console.log(body)

    // Error handling: Check if name or number is missing
    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'Name and number are required' })
    }

    // Error handling: Check if the name already exists in the phonebook
    const nameExists = persons.some(person => person.name === body.name)
    if (nameExists) {
        return response.status(400).json({ error: 'Name must be unique' })
    }

    const person = {
        id: generateId(5, 99999999),
        name: body.name,
        number: body.number,
    }
  
    persons = persons.concat(person)

    // Respond with the newly created person
    response.status(201).json(person)
  
})


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})