const router = require('express').Router();
const database = require('../databaseConnection');

const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const { ObjectId } = require('mongodb');

const passwordPepper = "SeCretPeppa4MySal+";


// 👉 GET ALL USERS
router.get('/', async (req, res) => {
	try {
		const userCollection = database.db('lab_example').collection('users');

		const users = await userCollection
			.find({})
			.project({ first_name: 1, last_name: 1, email: 1 })
			.toArray();

		res.render('index', { allUsers: users });

	} catch (err) {
		console.log(err);
		res.render('error', { message: 'Error connecting to MongoDB' });
	}
});


// 👉 ADD USER
router.post('/addUser', async (req, res) => {
	try {
		const userCollection = database.db('lab_example').collection('users');

		const password_salt = crypto.createHash('sha512');
		password_salt.update(uuid());

		const password_hash = crypto.createHash('sha512');
		password_hash.update(req.body.password + passwordPepper + password_salt);

		await userCollection.insertOne({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			email: req.body.email,
			password_salt: password_salt.digest('hex'),
			password_hash: password_hash.digest('hex')
		});

		res.redirect('/');
	} catch (err) {
		console.log(err);
		res.render('error', { message: 'Error adding user' });
	}
});


// 👉 DELETE USER
router.get('/deleteUser', async (req, res) => {
	try {
		const userCollection = database.db('lab_example').collection('users');

		const userId = req.query.id;

		if (userId) {
			await userCollection.deleteOne({
				_id: new ObjectId(userId)
			});
		}

		res.redirect('/');
	} catch (err) {
		console.log(err);
		res.render('error', { message: 'Error deleting user' });
	}
});


module.exports = router;