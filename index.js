require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan('tiny'))

let persons = [
    { id:"1", name: 'Arto Hellas', number: '040-123456' },
    { id:"2", name: 'Ada Lovelace', number: '39-44-5323523' },
    { id:"3", name: 'Dan Abramov', number: '12-43-234345' },
    { id:"4", name: 'Mary Poppendieck', number: '39-23-6423122' }
]

app.get('/', (request, response) => {
    response.send('<h1>Please use /api/persons </h1>')
})


app.get('/api/persons',(request, response, next) => {
	Person
		.find({})
		.then(result => {
			response.json(result)
            console.log(result)
		})
		.catch(error => next(error))
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${Date()}</p>
        `)
})


// ID:n luominen
const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(n => Number(n.id)))
      : 0
    return String(maxId + 1)
  }



  const postMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :body')

app.post('/api/persons', postMorgan, (request, response) => {
    const body = request.body
    console.log(request.body)

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number missing'
        })
    }
    const personInContancts = persons.find(person => person.name === body.name)
    if (personInContancts){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(person)
    console.log(person)
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
  response.status(204).end()
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

