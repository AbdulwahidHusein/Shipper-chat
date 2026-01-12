import prisma from '../config/database';
import { User } from '@prisma/client';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserByGoogleId = async (googleId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { googleId },
  });
};

export const createUser = async (data: {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}): Promise<User> => {
  return prisma.user.create({
    data,
  });
};

export const updateUser = async (
  id: string,
  data: {
    name?: string;
    picture?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  }
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};
