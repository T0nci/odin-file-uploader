const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUser = async (username, password) => {
  await prisma.user.create({
    data: {
      username: username,
      password: password,
    },
  });
};

const getUserByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
};
