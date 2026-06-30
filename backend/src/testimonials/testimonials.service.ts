import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialsRepository: Repository<Testimonial>,
  ) {}

  findAll() {
    return this.testimonialsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findActive() {
    return this.testimonialsRepository.find({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.testimonialsRepository.findOne({ where: { id } });
  }

  create(data: Partial<Testimonial>) {
    const testimonial = this.testimonialsRepository.create(data);
    return this.testimonialsRepository.save(testimonial);
  }

  async update(id: number, data: Partial<Testimonial>) {
    await this.testimonialsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.testimonialsRepository.delete(id);
    return { deleted: true };
  }
}
