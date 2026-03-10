import { User } from "../models/user.js"
import { Task } from "../models/task.js"
import logger from "../logs/logger.js"
import { Status } from "../constants/index.js"
import { encriptar } from "../common/bcrypt.js"
import { Op } from "sequelize"

async function create(req, res) {
  const {username, password} = req.body
  try{
    const newUser = await User.create({
      username,
      password
    })
    return res.json(newUser)
  }catch(e){
    logger.error(e)
    return res.json(e)
  }
}

async function get(req, res) {
  try{
    const users = await User.findAndCountAll({
      attributes:['id', 'username', 'password', 'status'],
      order: [['id', 'DESC']],
      where: {
        status: Status.ACTIVE
      }
    })

    res.json({
      total: users.count,
      data: users.rows
    })
  }catch(e){
    logger.error(e)
    return res.json(e)
  }
}

async function find(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username', 'status'],
      where: {
        id,
      },
    });
    res.json(user)
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
}

const update = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const passwordHash = await encriptar(password)
  try {
    const user = await User.update(
      {
        username,
        password: passwordHash,
      },
      { where: { id } },
    );
    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
};

const activateInactivate = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: 'No existe el status' });

  try {
    const user = await User.findByPk(id);
    if(!user) return res.status(400).json({ message: 'No existe el usuario' });
    if (user.status === status)
      return res
        .status(409)
        .json({ message: `El usuario ya se encuentra ${status}` });

    user.status = status;
    await user.save();
    res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.destroy({
      where: {
        userId: id,
      }
    })
    await User.destroy({
      where: {
        id,
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

async function listPagination(req, res) {
  try {
    const limit = Number(req.query.limit || 10);
    const page = Number(req.query.page || 1);
    const orderBy = req.query.orderBy || 'id';
    const orderDir = req.query.orderDir || 'DESC';
    const search = req.query.search || '';
    const status = req.query.status;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.username = {
        [Op.iLike]: `%${search}%`,
      };
    }

    if (status) {
      where.status = status;
    }

    const users = await User.findAndCountAll({
      attributes: ['id', 'username', 'status'],
      where,
      limit,
      offset,
      order: [[orderBy, orderDir]],
    });

    return res.json({
      total: users.count,
      page,
      pages: Math.ceil(users.count / limit),
      data: users.rows,
    });
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

async function findWithTasks(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      attributes: ['username'],
      where: { id },
      include: [
        {
          model: Task,
          attributes: ['name', 'done'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
}

export default {
  create,
  get,
  listPagination,
  find,
  findWithTasks,
  update,
  activateInactivate,
  eliminar
}