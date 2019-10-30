import * as Yup from 'yup';
import { startOfDay, parseISO, addMonths } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

import NewEnrollmentMail from '../jobs/NewEnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async show(req, res) {
    const { page = 1 } = req.query;

    const enrollment = await Enrollment.findAll({
      order: ['start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'start_date',
        'end_date',
        'price',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration'],
        },
      ],
    });

    return res.json(enrollment);
  }

  async index(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      attributes: [
        'id',
        'start_date',
        'end_date',
        'price',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .positive()
        .required(),
      plan_id: Yup.number()
        .integer()
        .positive()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const ajusted_start_date = startOfDay(parseISO(start_date));

    const end_date = addMonths(ajusted_start_date, plan.duration);

    const price = plan.duration * plan.price;

    const newEnrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: ajusted_start_date,
      end_date,
      price,
    });

    // Add mail in the Queue
    await Queue.add(NewEnrollmentMail.key, {
      newEnrollment,
      student,
      plan,
    });

    return res.json(newEnrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number()
        .integer()
        .positive(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found' });
    }

    let { plan } = enrollment;

    if (req.body.plan_id && req.body.plan_id !== enrollment.plan_id) {
      const newPlan = await Plan.findByPk(req.body.plan_id);
      if (!newPlan) {
        return res.status(401).json({ error: 'Plan not found' });
      }
      enrollment.price = newPlan.duration * newPlan.price;
      enrollment.plan_id = newPlan.id;
      plan = newPlan;
    }

    if (req.body.start_date && req.body.start_date !== enrollment.start_date) {
      enrollment.start_date = startOfDay(parseISO(req.body.start_date));
    }

    enrollment.end_date = addMonths(enrollment.start_date, plan.duration);

    await enrollment.save();

    return res.json({
      id: enrollment.id,
      price: enrollment.price,
      start_date: enrollment.start_date,
      end_date: enrollment.end_date,
      created_at: enrollment.created_at,
      updated_at: enrollment.updated_at,
      student: enrollment.student,
      plan: {
        id: plan.id,
        title: plan.title,
        duration: plan.duration,
      },
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(401).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy();

    return res.send();
  }
}

export default new EnrollmentController();
