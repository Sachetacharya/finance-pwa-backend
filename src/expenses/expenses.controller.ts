import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { SyncDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getAll(@CurrentUser() user: { userId: string }) {
    return this.expensesService.findAllByUser(user.userId);
  }

  @Post('sync')
  sync(@CurrentUser() user: { userId: string }, @Body() dto: SyncDto) {
    return this.expensesService.sync(user.userId, dto);
  }
}
