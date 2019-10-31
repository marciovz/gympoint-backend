import * as Yup from 'yup';
import Help_order from '../models/Help_order';
import Student from '../models/Student';

import NewAnswerMail from '../jobs/NewAnswerMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async show(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const help_order = await Help_order.findAll({
      where: {
        answer_at: null,
      },
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(help_order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const help_order = await Help_order.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });
    if (!help_order) {
      return res.status(400).json({ error: 'Help_order not found' });
    }

    help_order.answer = req.body.answer;
    help_order.answer_at = new Date();

    await help_order.save();

    await Queue.add(NewAnswerMail.key, {
      student: help_order.student,
      question: help_order.question,
      answer: help_order.answer,
    });

    return res.json(help_order);
  }
}

export default new AnswerController();
