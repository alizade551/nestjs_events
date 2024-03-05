import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';
import { ListEvents } from './dto/list.events';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(protected readonly eventService: EventService) {}

  // @Get('practice')
  // async practice() {
  //   return await this.repository.find({
  //     select: ['id', 'when', 'name'],
  //     where: [
  //       {
  //         id: MoreThan(3),
  //         when: MoreThan(new Date('2021-02-12T13:00:00')),
  //       },
  //       {
  //         description: Like('%meet%'),
  //       },
  //     ],
  //     take: 2,
  //     order: {
  //       id: 'DESC',
  //     },
  //   });
  // }

  // @Get('practice2')
  // async practice2() {
  //   /* 1 */
  //   // const event = await this.repository.findOne({
  //   //   where: { id: 1 },
  //   //   relations: {
  //   //     attendees: true,
  //   //   },
  //   // });
  //   // return event;
  //   /* 2 */
  //   // const event = await this.repository.findOne({ where: { id: 1 } });
  //   // const attendee = new Attendee();
  //   // attendee.name = 'Jerry';
  //   // attendee.event = event;
  //   // await this.attendeeRepository.save(attendee);
  //   /* 3 */
  //   // const event = new Event();
  //   // event.id = 1;
  //   // const attendee = new Attendee();
  //   // attendee.name = 'Jerry';
  //   // attendee.event = event;
  //   // await this.attendeeRepository.save(attendee);
  //   /* 4 */
  //   // const event = await this.repository.findOne({
  //   //   where: { id: 1 },
  //   //   relations: ['attendees'],
  //   // });
  //   // const attendee = new Attendee();
  //   // attendee.name = 'Hafiz';
  //   // event.attendees.push(attendee);
  //   // event.attendees = [];
  //   // await this.repository.save(event);
  //   // return event;

  //   return await this.repository
  //     .createQueryBuilder('e')
  //     .select(['e.id', 'e.name'])
  //     .orderBy('e.id', 'DESC')
  //     .take(3)
  //     .getMany();
  // }
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: filter.limit,
        },
      );
    return events;
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventService.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You are not authorized to update`);
    }

    return await this.eventService.updateEvent(event, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async remove(@Param('id', ParseIntPipe) id, @CurrentUser() user: User) {
    const event = await this.eventService.getEventWithAttendeeCount(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You are not authorized to update`);
    }
    const result = await this.eventService.deleteEvent(id);

    if (result?.affected !== 1) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
  }
}
