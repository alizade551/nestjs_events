import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';

@Controller('school')
export class TrainingController {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  @Post('/create')
  public async savingRelation() {
    // const subject = new Subject();
    // subject.name = 'Math';
    // await this.subjectRepository.save(subject);

    const teacher1 = new Teacher();
    teacher1.name = 'Hafiz Alizadah';

    const teacher2 = new Teacher();
    teacher2.name = 'Alili Ali';

    await this.teacherRepository.save([teacher1, teacher2]);
    // subject.teachers = [teacher1, teacher2];
  }

  @Post('/remove')
  public async removingRelation() {
    // const subject = await this.subjectRepository.findOne({
    //   where: { id: 1 },
    //   relations: ['teachers'],
    // });
    // subject.teachers = subject.teachers.filter((teacher) => teacher.id !== 2);
    // await this.subjectRepository.save(subject);
    // const subject = await this.subjectRepository.findOne({ where: { id: 5 } });
    // if (!subject) throw new NotFoundException();
    // // delete teacher
    // await this.subjectRepository.remove(subject);
    // const teacher = await this.teacherRepository.findOne({ where: { id: 8 } });
    // // delete teacher
    // await this.teacherRepository.remove(teacher);

    await this.subjectRepository
      .createQueryBuilder('s')
      .update()
      .set({
        name: 'Confidential',
      })
      .execute();
  }
}
