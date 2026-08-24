import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Entité de base à étendre par toutes les entités du projet.
 * Fournit un id UUID, les timestamps de création/mise à jour,
 * et le soft-delete (deletedAt) prêt à l'emploi.
 *
 * Exemple :
 *   @Entity('users')
 *   export class User extends AbstractEntity {
 *     @Column()
 *     email: string;
 *   }
 */
export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  declare deletedAt: Date | null;
}
