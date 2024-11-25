import { User } from '../api/users/entities/user.entity';
import { ROLES } from '../utils/constants';
import * as bcrypt from 'bcryptjs';

export async function UserSeeder(sourceConfig) {
  const userToStore = [
    {
      email: 'admin+1@mailinator.com',
      role: ROLES.ADMIN,
      password: 'Admin@123!',
      name: 'Admin',
    },
  ];
  const userRepository = sourceConfig.getRepository(User);

  for (const user of userToStore) {
    // check user exist or not
    const isUserExist = await userRepository.countBy({
      email: user.email,
    });

    if (!isUserExist) {
      const password = await bcrypt.hash(user.password, 10);
      const userObj = userRepository.create({
        ...user,
        password,
      });
      await userRepository.save(userObj);
    } else {
      console.error(`User ${user.email} already exists`);
    }
  }
}
