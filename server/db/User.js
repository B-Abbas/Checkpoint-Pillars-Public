const { user } = require('pg/lib/defaults');
const { Sequelize, Op}  = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  userType: {
    type: Sequelize.ENUM("STUDENT", "TEACHER"),
    defaultValue: "STUDENT",
    allowNull: false,
  },
  isStudent: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === "STUDENT"
    }
  },
  isTeacher: {
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType === "TEACHER"
    }
  },
});

User.findUnassignedStudents = async function() {
  const noMentor = await User.findAll({
    where: {
      userType: "STUDENT",
      mentorId: null
    }
  })
  return noMentor
}

User.prototype.getPeers = async function() {
  const peers = await User.findAll({
    where: { mentorId: this.mentorId,
    name: {
      [Op.ne]: this.name
    } }
  })
  return peers
}

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

User.findTeachersAndMentees = async function() {
  const allTeachers = await User.findAll({
    where: {
      userType: "TEACHER",
    },
    include: { model: User, as: "mentees" }
  })
  return allTeachers
}

User.beforeUpdate(async (ins) => {
  const mentor = await User.findByPk(ins.mentorId)
  if (mentor && mentor.userType === "STUDENT") {
    throw new Error ("invalid update: cannot update teachers to have mentors!")
  }
})

User.beforeSave((ins) => {
  if(ins.userType === "TEACHER" && ins.mentorId) {
    throw new Error ("invalid update: cannot update a mentee to a teacher!")
    }
})

User.afterUpdate( async(ins) => {
  const mentees = await ins.getMentees()
  if (ins.userType === "STUDENT" && mentees.length) {
    throw new Error ("invalid update: cannot update a teacher with mentees to a student!")
  }
})

module.exports = User;