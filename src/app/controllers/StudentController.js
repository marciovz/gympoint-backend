import { Op } from 'sequelize';
import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  // store, show, index, update, delete
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .positive()
        .integer()
        .required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails ' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    try {
      const student = await Student.create(req.body);
      return res.json(student);
    } catch (err) {
      return res.status(500).json({ error: 'Can not create in database.' });
    }
  }

  async show(req, res) {
    try {
      const queryName = req.query.name;

      const objQuery = queryName
        ? {
            where: {
              name: {
                [Op.iLike]: `%${queryName}%`,
              },
            },
          }
        : {};

      const students = await Student.findAll(objQuery);

      return res.json(students);
    } catch (err) {
      return res.status(500).json({ error: 'Can not read database.' });
    }
  }

  async index(req, res) {
    const { id } = req.params;

    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(400).json({ error: 'Student not found.' });
      }

      return res.json(student);
    } catch (err) {
      return res.status(500).json({ error: 'Can not read database.' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .positive()
        .integer(),
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;
    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(400).json({ error: 'Student not found.' });
      }

      const { email } = req.body;
      if (email && email !== student.email) {
        const otherStudent = await Student.findOne({
          where: { email: req.body.email },
        });

        if (otherStudent) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
      }

      await student.update(req.body);
      return res.json(student);
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Can not update student in database.' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(400).json({ error: 'Student not found.' });
      }
      await student.destroy();
      return res.send();
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Can not delete student in database.' });
    }
  }
}

export default new StudentController();
