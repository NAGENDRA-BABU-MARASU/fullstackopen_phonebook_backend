const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

morgan.token('body', function getBody(req) {
  return JSON.stringify(req.body)
})

const app = express();

app.use(cors())
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

app.get('/api/persons', (req, res) => {
	res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);
	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
});

const generateId = () => {
	const max = 1000000;
	return Math.floor(Math.random() * max);
};

app.post('/api/persons', (req, res) => {
	const body = req.body;
	if (!body.name || !body.number) {
		return res.status(400).json({
			error: 'missing name or number',
		});
	}
	const alreadyExists = persons.find(
		(person) => person.name === body.name
	);
	if (alreadyExists) {
		return res.status(400).json({
			error: 'name must be unique',
		});
	} else {
		const person = {
			name: body.name,
			number: body.number,
			id: generateId(),
		};
		persons = persons.concat(person);
		res.json(person);
	}
});

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	persons = persons.filter((person) => person.id !== id);
	res.status(204).end();
});

app.get('/info', (req, res) => {
	res.send(
		`Phonebook has info for ${
			persons.length
		} people <br/> ${new Date()}`
	);
});

const PORT = process.env.PORT ||  3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
