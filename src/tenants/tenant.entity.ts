import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn({ name: 'tenant_id' })
  id: number;

  @Column({ name: 'tenant_name' })
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ name: 'connection_uri', nullable: true })
  connectionUri: string;

  @Column({ name: 'start_date', nullable: true, type: 'date' })
  startDate: Date;

  @Column({ name: 'expiry_date', nullable: true, type: 'date' })
  expiryDate: Date;
}
