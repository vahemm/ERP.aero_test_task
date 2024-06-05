import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "../user/user.entity";

@Entity()
class Token {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public accessToken: string;

  @Column()
  public refreshToken : string;

  @Column()
  public deviceId: string;

  @ManyToOne(() => User, (user: User) => user.tokens)
  public user: User;
  
}

export default Token;
