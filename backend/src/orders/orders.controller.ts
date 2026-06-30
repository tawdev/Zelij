import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
    @Get()
    findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.ordersService.findAll(Number(page), Number(limit), status, search);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
    @Get('stats')
    getStats() {
        return this.ordersService.getStats();
    }
    
    @Get('track/:reference')
    getTracking(@Param('reference') reference: string) {
        return this.ordersService.findByReference(reference);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(Number(id));
    }

    @Post() // Keep public for customers
    create(@Body() orderData: CreateOrderDto) {
        return this.ordersService.create(orderData);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(Number(id), updateDto.status, updateDto.email);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Post(':id/resend-invoice')
    resendInvoice(@Param('id') id: string) {
        return this.ordersService.resendInvoice(Number(id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(Number(id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Post('bulk-delete')
    removeBulk(@Body('ids') ids: number[]) {
        return this.ordersService.removeBulk(ids);
    }
}
