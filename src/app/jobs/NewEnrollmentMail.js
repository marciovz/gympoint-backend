import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewEnrolmentMail {
  get key() {
    return 'NewEnrollmentMail';
  }

  async handle({ data }) {
    const { newEnrollment, student, plan } = data;
    const mes = plan.duration === 1 ? 'mês' : 'meses';

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula efetuada - GymPoint',
      template: 'newEnrollment',
      context: {
        matricula: newEnrollment.id,
        studentName: student.name,
        planName: plan.title,
        startDate: format(
          parseISO(newEnrollment.start_date),
          "dd'/'MM'/'yyyy",
          {
            locale: pt,
          }
        ),
        durationPlan: `${plan.duration} ${mes}`,
        priceMonth: plan.price.toLocaleString('pt', {
          style: 'currency',
          currency: 'BRL',
        }),
      },
    });
  }
}

export default new NewEnrolmentMail();
