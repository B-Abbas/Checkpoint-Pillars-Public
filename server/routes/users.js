const router = require('express').Router();
const app = require('../app');
const { Sequelize, Op}  = require('sequelize');
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:
router.get('/unassigned', async (req, res, next) => {
  try {
    const noMentor = await User.findUnassignedStudents()
    res.status(200).send(noMentor)
  } catch(err) {
    next(err)
  }
})

router.get('/teachers', async (req, res, next) => {
  try {
  const teachersAndMentees = await User.findTeachersAndMentees()
  res.status(200).send(teachersAndMentees)
  } catch(err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const userID = Number(req.params.id)
    if(isNaN(userID)) {
      res.status(400).send("Not a number")
    } else {
      const userToDelete = await User.destroy({
        where: { id: userID }
      })
      if (userToDelete) {
        res.status(204).send("User deleted")
      } else {
        res.status(404).send("User not found")
      }
    }
  } catch (err) {
    next(err)
}
})

router.post('/', async (req, res, next) => {
  try {
    const inputName = req.body.name
    const [createdUser, created] = await User.findOrCreate({
      where: { name: inputName }
    })
    created ? res.status(201).send(createdUser)
    : res.status(409).send("user already exists")
  } catch(err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id
    const updatedName = req.body.name
    const idInDatabase = await User.findByPk(userId)
    if (idInDatabase !== null) {
      const updatedUser = await idInDatabase.update({name: updatedName})
      res.status(200).send(updatedUser)
    } else {
      res.status(404).send("Not Found")
    }
  } catch(err) {
    next(err)
  }
})

router.get('/', async(req, res, next) => {
  const queryName = req.query.name
  const matchingNames = await User.findAll({
    where: {
      name: {
        [Op.iLike]: `%${queryName}%`,
      }
    }
  })
  res.status(200).send(matchingNames)
})

module.exports = router;
