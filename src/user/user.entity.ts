import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Token from "../token/token.entity";

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

  @Column()
  public password: string;

  @OneToMany(() => Token, (token: Token) => token.user)
  public tokens: Token[];
}

export default User;
