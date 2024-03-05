import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Expose } from 'class-transformer';
import { User } from 'src/auth/user.entity';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.attendees, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  @Expose()
  eventId: number;

  @Column('enum', {
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Accepted,
  })
  @Expose()
  answer: AttendeeAnswerEnum;

  @ManyToOne(() => User, (user) => user.attended)
  @JoinColumn({ name: 'userId' })
  @Expose()
  user: User;

  @Column()
  @Expose()
  userId: number;
}
