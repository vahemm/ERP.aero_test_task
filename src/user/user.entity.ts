import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Token from "../token/token.entity";
import File from "../file/file.entity";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column({ unique: true, nullable: true })
  public email: string;

  @Column({ unique: true, nullable: true })
  public phone: string;

  @Column()
  public fullName: string;

  @Column({ select: false })
  public password: string;

  @OneToMany(() => Token, (token: Token) => token.user)
  public tokens: Token[];

  @OneToMany(() => File, (file: File) => file.user)
  public files: Token[];
}

export default User;
