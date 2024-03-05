import { Equal, Repository } from 'typeorm';
import { Attendee } from './attendee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

@Injectable()
export class AttendeeService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}

  public async findByEventId(event: number): Promise<Attendee> {
    return await this.attendeeRepository.findOne({
      where: { eventId: Equal(event) },
    });
  }

  public async findOneByEventIdAndUserId(
    eventId: number,
    userId: number,
  ): Promise<Attendee | undefined> {
    return await this.attendeeRepository.findOne({
      where: { userId: Equal(userId), eventId: Equal(eventId) },
    });
  }

  public async createOrUpdate(
    createAttendeeDto: CreateAttendeeDto,
    eventId: number,
    userId: number,
  ): Promise<Attendee> {
    const attendee =
      (await this.findOneByEventIdAndUserId(eventId, userId)) ??
      (await new Attendee());

    attendee.eventId = eventId;
    attendee.userId = userId;
    attendee.answer = createAttendeeDto.answer;

    return await this.attendeeRepository.save(attendee);
  }
}
