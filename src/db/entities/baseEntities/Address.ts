import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
