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

export const findAllUsers = async (excludeUserId?: string) => {
  return prisma.user.findMany({
    where: excludeUserId
      ? {
          id: {
            not: excludeUserId,
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      isOnline: true,
      lastSeen: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const findOnlineUsers = async (excludeUserId?: string) => {
  return prisma.user.findMany({
    where: {
      isOnline: true,
      ...(excludeUserId
        ? {
            id: {
              not: excludeUserId,
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      picture: true,
      isOnline: true,
      lastSeen: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const updateOnlineStatus = async (
  id: string,
  isOnline: boolean
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: {
      isOnline,
      lastSeen: new Date(),
    },
  });
};
