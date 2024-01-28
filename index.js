require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

morgan.token('body', function getBody(req) {
	return JSON.stringify(req.body);
});

const app = express();
app.use(express.static('dist'));
app.use(cors());
app.use(express.json());
app.use(
	morgan(
		':method :url :status :res[content-length] :response-time :body'
	)
);

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

app.get('/', (req, res) => {
	res.send('Hello world');
});

app.get('/api/persons', (req, res, next) => {
	Person.find({})
		.then((persons) => {
			res.json(persons);
		})
		.catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => {
			next(error);
		});
});

app.post('/api/persons', (req, res, next) => {
	const body = req.body;

	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'missing name or number',
		});
	}

	Person.find({ name: body.name }).then((person) => {
		if (person.length === 0) {
			const person = new Person({
				name: body.name,
				number: body.number,
			});

			person
				.save()
				.then((savedPerson) => {
					res.json(savedPerson);
				})
				.catch((error) => next(error));
		} else {
			return res.status(400).json({
				error: 'name must be unique',
			});
		}
	});

	// const body = req.body;
	// if (!body.name || !body.number) {
	// 	return res.status(400).json({
	// 		error: 'missing name or number',
	// 	});
	// }
	// const alreadyExists = persons.find(
	// 	(person) => person.name === body.name
	// );
	// if (alreadyExists) {
	// 	return res.status(400).json({
	// 		error: 'name must be unique',
	// 	});
	// } else {
	// 	const person = {
	// 		name: body.name,
	// 		number: body.number,
	// 		id: generateId(),
	// 	};
	// 	persons = persons.concat(person);
	// 	res.json(person);
	// }
});

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndDelete(req.params.id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body;
	const person = {
		name: body.name,
		number: body.number,
	};

	Person.findByIdAndUpdate(req.params.id, person, {
		new: true,
		runValidators: true, 
		context: 'query'
	})
		.then((updatedPerson) => {
			res.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.get('/info', (req, res, next) => {
	Person.find({})
		.then((persons) => {
			res.send(
				`Phonebook has info for ${
					persons.length
				} people <br/> ${new Date()}`
			);
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({
		error: 'Unknown endpoint',
	});
};
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.log(error.message);

	if (error.name === 'CastError') {
		return res.status(400).send({
			error: 'malformatted id',
		});
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message });
	}
	next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
