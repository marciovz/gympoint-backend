import * as Yup from 'yup';

import Help_order from '../models/Help_order';
import Student from '../models/Student';

class Help_orderController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const help_order = await Help_order.findAll({
      where: {
        student_id: req.params.id,
      },
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(help_order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student not find' });
    }

    const help_order = await Help_order.create({
      student_id: student.id,
      question: req.body.question,
    });

    return res.json(help_order);
  }
}

export default new Help_orderController();
