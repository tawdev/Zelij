import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage, ContactStatus } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<ContactMessage> {
    const newMessage = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(newMessage);
  }

  async findAll(): Promise<ContactMessage[]> {
    return await this.contactRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ContactMessage> {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async updateStatus(id: number, status: ContactStatus, adminNote?: string): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.status = status;
    if (adminNote !== undefined) {
      message.adminNote = adminNote;
    }
    return await this.contactRepository.save(message);
  }

  async remove(id: number): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
