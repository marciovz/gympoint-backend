import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async show(req, res) {
    const plans = await Plan.findAll();
    return res.json(plans);
  }

  async index(req, res) {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(401).json({ error: 'Plan not found' });
    }
    return res.json(plan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .positive()
        .integer()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findOne({
      where: {
        title: req.body.title,
      },
    });

    if (plan) {
      return res.status(401).json({ error: 'Plan already exists' });
    }

    const newPlan = await Plan.create(req.body);

    return res.json(newPlan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not find' });
    }

    const { title, duration, price } = await plan.update(req.body);

    return res.json({ title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not find' });
    }

    await plan.destroy();

    return res.send();
  }
}

export default new PlanController();
