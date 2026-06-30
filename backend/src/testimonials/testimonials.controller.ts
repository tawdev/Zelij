import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { Testimonial } from './testimonial.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() {
    return this.testimonialsService.findActive();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.testimonialsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: Partial<Testimonial>) {
    return this.testimonialsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: Partial<Testimonial>) {
    return this.testimonialsService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(+id);
  }
}
