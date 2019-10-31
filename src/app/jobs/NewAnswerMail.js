import Mail from '../../lib/Mail';

class NewAnswerMail {
  get key() {
    return 'NewAnswerMail';
  }

  async handle({ data }) {
    const { student, question, answer } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Retorno de questionamento',
      template: 'newAnswer',
      context: {
        studentName: student.name,
        question,
        answer,
      },
    });
  }
}

export default new NewAnswerMail();
