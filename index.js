const express = require('express');
const http = require('http');
const MongoClient = require('mongodb').MongoClient;

const routes = require('./routes/routes');

const port = process.env.PORT || 80;
const rootUsername = process.env.MONGO_INITDB_ROOT_USERNAME;
const rootPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;

const dbName = process.env.NODE_ENV === 'dev' ? 'database-test' : 'database';
const url = `mongodb://${rootUsername}:${rootPassword}@${dbName}:27017?authMechanism=SCRAM-SHA-1&authSource=admin`;

const options = {
	useNewUrlParser: true,
	reconnectTries: 60,
	recoonectInterval: 1000
};

const app = express();
http.Server(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use((req, res) => {
	res.status(404);
});

MongoClient.connect(url, options, (err, database) => {
	if (err) {
		console.log(`FATAL MONGODB CONNECTION ERROR: ${err}:${err.stack}`)
		process.exit(1);
	}
	app.locals.db = database.db('api');
	http.listen(port, () => {
		console.log(`Listening on port ${port}`);
		app.emit('APP_STARTED');
	})
});

module.exports = app;
