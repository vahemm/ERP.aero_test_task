import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../user/user.entity";

@Entity()
class File {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public fileName: string;

  @Column()
  public extension: string;

  @Column()
  public mimeType: string;

  @Column()
  public fileSize: string;

  @CreateDateColumn()
  public uploadDate: Date;

  @ManyToOne(() => User, (user: User) => user.files)
  public user: User;
}

export default File;
