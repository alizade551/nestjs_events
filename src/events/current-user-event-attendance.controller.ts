import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AttendeeService } from './attendees.service';
import { EventService } from './event.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';
import { Attendee } from './attendee.entity';

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
export class CurrentUserEventAttendanceController {
  constructor(
    private readonly attendeeService: AttendeeService,
    private readonly eventService: EventService,
  ) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    return await this.eventService.getEventsOrganizedAttendedByUserIdPaginated(
      user.id,
      {
        limit: 5,
        currentPage: page,
      },
    );
  }

  @Get(':eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ): Promise<Attendee | NotFoundException> {
    const attendee = await this.attendeeService.findOneByEventIdAndUserId(
      eventId,
      user.id,
    );

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  @Put(':eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async createOrUpdate(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() createAttendeeDto: CreateAttendeeDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.attendeeService.createOrUpdate(
      createAttendeeDto,
      eventId,
      currentUser.id,
    );
  }
}
