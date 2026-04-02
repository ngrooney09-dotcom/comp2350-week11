
const router = require('express').Router();
const database = require('../databaseConnection');

const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const { ObjectId } = require('mongodb');
const Joi = require('joi');

const passwordPepper = "SeCretPeppa4MySal+";


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



router.get('/deleteUser', async (req, res) => {
	try {
		const userCollection = database.db('lab_example').collection('users');
		const petCollection = database.db('lab_example').collection('pets');

		let user_id = req.query.id;

		const schema = Joi.object({
			user_id: Joi.string().alphanum().min(24).max(24).required()
		});

		const validationResult = schema.validate({ user_id });

		if (validationResult.error) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid user_id' });
		}

		await petCollection.deleteMany({ user_id: new ObjectId(user_id) });
		await userCollection.deleteOne({ _id: new ObjectId(user_id) });

		console.log("deleteUser done");

		res.redirect("/");
	} catch (ex) {
		console.log(ex);
		res.render('error', { message: 'Error connecting to MongoDB' });
	}
});



router.get('/showPets', async (req, res) => {
	try {
		const petCollection = database.db('lab_example').collection('pets');

		let user_id = req.query.id;

		const schema = Joi.object({
			user_id: Joi.string().alphanum().min(24).max(24).required()
		});

		const validationResult = schema.validate({ user_id });

		if (validationResult.error) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid user_id' });
		}

		const pets = await petCollection
			.find({ user_id: new ObjectId(user_id) })
			.toArray();

		pets.forEach(pet => {
			pet.pet_id = pet._id;
		});

		res.render('pets', {
			allPets: pets,
			user_id: user_id
		});

	} catch (ex) {
		console.log(ex);
		res.render('error', { message: 'Error connecting to MongoDB' });
	}
});


router.post('/addPet', async (req, res) => {
	try {
		const petCollection = database.db('lab_example').collection('pets');

		let user_id = req.body.user_id;

		const schema = Joi.object({
			user_id: Joi.string().alphanum().min(24).max(24).required(),
			name: Joi.string().min(2).max(50).required(),
			pet_type: Joi.string().min(2).max(50).required()
		});

		const validationResult = schema.validate({
			user_id,
			name: req.body.pet_name,
			pet_type: req.body.pet_type
		});

		if (validationResult.error) {
			console.log(validationResult.error);
			return res.render('error', { message: 'Invalid pet data' });
		}

		await petCollection.insertOne({
			name: req.body.pet_name,
			user_id: new ObjectId(user_id),
			pet_type: req.body.pet_type
		});

		res.redirect(`/showPets?id=${user_id}`);

	} catch (ex) {
		console.log(ex);
		res.render('error', { message: 'Error adding pet' });
	}
});

module.exports = router;

