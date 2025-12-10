import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ENV_KEY } from '../common/const/env.const';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly cs: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.users.findOne({ where: { email } });

    if (user) throw new BadRequestException();

    const hash = await bcrypt.hash(
      password,
      this.cs.get<number>(ENV_KEY.HASH_ROUNDS)!,
    );

    await this.users.save({
      email,
      password: hash,
    });
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.users.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException();
    }

    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) throw new BadRequestException();

    return {
      accessToken: await this.issueToken(user, false),
      refreshToken: await this.issueToken(user, true),
    };
  }

  async rotateAccess(rawToken: string) {
    // const payload = await this.parseBearerToken(rawToken);
    //
    // return {
    //   accessToken: await this.issueToken(payload, false),
    // };

    return 1;
  }

  private parseBasicToken(rawToken: string) {
    const [, token] = rawToken.split(' ');

    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    const [email, password] = decoded.split(':');

    return {
      email,
      password,
    };
  }

  private async issueToken(user: User, isRefresh: boolean) {
    const accessTokenSecret = this.cs.get<string>(ENV_KEY.ACCESS_TOKEN_SECRET);
    const refreshTokenSecret = this.cs.get<string>(
      ENV_KEY.REFRESH_TOKEN_SECRET,
    );

    return this.jwt.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefresh ? 'refresh' : 'access',
      },
      {
        secret: isRefresh ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefresh ? '24h' : 300,
      },
    );
  }
}
