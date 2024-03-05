import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Event, PaginatedEvents } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeAnswerEnum } from './attendee.entity';
import { ListEvents, WhenEventFilter } from './dto/list.events';
import { PaginateOptions, paginate } from 'src/paginator/paginator';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from 'src/auth/user.entity';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventRepository.createQueryBuilder('e').orderBy('e.id');
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      await this.getEventsWithAttendeeCountFilteredQuery(filter),
      paginateOptions,
    );
  }

  private getEventsWithAttendeeCountFilteredQuery(
    filter?: ListEvents,
  ): SelectQueryBuilder<Event> {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        // cSpell:disable
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      }

      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
        );
      }
    }

    return query;
  }

  public async getEventWithAttendeeCount(
    id: number,
  ): Promise<Event> | undefined {
    const query = await this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id= :id',
      {
        id,
      },
    );
    this.logger.debug(query.getSql());
    return query.getOne();
  }

  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventRepository.findOne({ where: { id } });
  }

  public async createEvent(
    createEventDto: CreateEventDto,
    user: User,
  ): Promise<Event> {
    return await this.eventRepository.save(
      new Event({
        ...createEventDto,
        organizer: user,
        when: new Date(createEventDto.when),
      }),
    );
  }

  public async updateEvent(
    event: Event,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventRepository.save(
      new Event({
        ...event,
        ...updateEventDto,
        when: updateEventDto.when ? new Date(updateEventDto.when) : event.when,
      }),
    );
  }

  public getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) => {
          return qb.where('attendee.answer=:answer', {
            answer: AttendeeAnswerEnum.Accepted,
          });
        },
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) => {
          return qb.where('attendee.answer=:answer', {
            answer: AttendeeAnswerEnum.Maybe,
          });
        },
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) => {
          return qb.where('attendee.answer=:answer', {
            answer: AttendeeAnswerEnum.Rejected,
          });
        },
      );
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventRepository
      .createQueryBuilder('e')
      .delete()
      .where('id= :id', { id })
      .execute();
  }

  public async getEventsOrganizedByUserIdPaginated(
    userId: number,
    paginatedOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      await this.getEventsOrganizedByUserIdQuery(userId),
      paginatedOptions,
    );
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('e.organizerId = :userId', {
      userId,
    });
  }

  public async getEventsOrganizedAttendedByUserIdPaginated(
    userId: number,
    paginatedOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      await this.getEventsOrganizedAttendedByUserIdQuery(userId),
      paginatedOptions,
    );
  }

  private getEventsOrganizedAttendedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    // SELECT * FROM events e LEFT JOIN attendees a ON e.eventId = a.eventId WHERE a.userId = :userId;
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId=:userId', { userId });
  }
}
