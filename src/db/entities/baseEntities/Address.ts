import { Length } from 'class-validator';
import {
  BaseEntity,
  Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('address')
export default class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  address?: string;

  @Column()
  country?: string;

  @Column({
    nullable: true,
  })
  state?: string;

  @Column()
  city?: string;

  @Column()
  street?: string;

  @Column()
  zip?: string;

  @Column()
  @Length(1, 32)
  addressName?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
