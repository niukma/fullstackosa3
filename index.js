require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const postMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :body')


app.use(cors())
app.use(express.static('dist'))
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan('tiny'))


// Hakee databasessa olevat ihmiset ja antaa json responsen
app.get('/api/persons',(request, response, next) => {
  Person
    .find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

// Hakee databasesta taulukon ja tarkastaa monta yksilöä siinä on. Antaa ihmisten määrän ja päivämäärän tuloksena.
app.get('/info', (request, response) => {
  Person
    .find({})
    .then(result => {
      response.send(`
      <p>Phonebook has info for ${result.length} people</p>
      <p>${Date()}</p>
      `)
    })
})

// Käsittelee lisäyksen, tarkemmin post pyynnön. Lisää näin name ja number kohdissa olevat tekstit ja luo niistä uuden yhteystiedon.
app.post('/api/persons', postMorgan, (request, response, next) => {
  const body = request.body
  console.log(request.body)

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))


})

// PUT request, jolle annetaan ID. Voi vaihtaa nimen ja numeron.
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})



// Etsii yhteystiedon ID:n mukaan ja antaa sen takaisin. Antaa 404 jos ei löydä
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      }else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

// Poistaa annetun yhteystiedon (ID liitännäinen)
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))

})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

