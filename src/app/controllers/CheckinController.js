import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(checkins);
  }

  async store(req, res) {
    // Busca os dados do estudante
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not find' });
    }

    // busca os dados de matrícula
    const enrollment = await Enrollment.findOne({
      where: {
        student_id: student.id,
        end_date: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: 'You do not have an active enrollment' });
    }

    // verifica quantidade de checkin durante os últimos sete dias
    const { count } = await Checkin.findAndCountAll({
      where: {
        student_id: student.id,
        created_at: {
          [Op.between]: [
            startOfDay(subDays(new Date(), 7)),
            endOfDay(new Date()),
          ],
        },
      },
    });

    if (count >= 5) {
      return res
        .status(401)
        .json({ error: `You have exceeded the maximum allowed checkin` });
    }

    const checkin = await Checkin.create({ student_id: student.id });

    return res.json({
      checkin,
      count_checkin: count + 1,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      enrollment: {
        id: enrollment.id,
        end_date: enrollment.end_date,
      },
    });
  }
}

export default new CheckinController();
