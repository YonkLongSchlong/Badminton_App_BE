import { eq } from "drizzle-orm/pg-core/expressions";
import { users } from "../db/schema";
import * as schema from "../db/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { User } from "../routes/userRoutes";
import type { ApiResponse } from "../../types";

export interface UserService {
  getAllUser(): Promise<ApiResponse>;
  getUser(id: number): Promise<ApiResponse>;
  createUser(data: any): Promise<ApiResponse>;
  updateUser(id: number, data: any): Promise<ApiResponse>;
  deleteUser(id: number): Promise<ApiResponse>;
}

type NewUser = typeof users.$inferInsert;

export class UserServiceImpl implements UserService {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * GET ALL USERS
   */
  async getAllUser(): Promise<ApiResponse> {
    try {
      const users = await this.db.query.users.findMany();
      return {
        status: 200,
        data: users,
      };
    } catch (error) {
      return {
        status: 500,
        msg: error as Error,
      };
    }
  }

  /**
   * GET USER BY ID
   */
  async getUser(id: number): Promise<ApiResponse> {
    try {
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, id),
      });
      if (user === undefined) {
        return {
          status: 404,
          msg: `User with id ${id} not found`,
        };
      }

      return {
        status: 200,
        data: user,
      };
    } catch (error) {
      return {
        status: 500,
        msg: error as Error,
      };
    }
  }

  /**
   * CREATE USER
   */
  async createUser(data: NewUser): Promise<ApiResponse> {
    try {
      data.role = "user";
      const user = await this.db.insert(users).values(data).returning();
      return {
        status: 200,
        data: user,
      };
    } catch (error) {
      return {
        status: 500,
        msg: error as Error,
      };
    }
  }

  /**
   * UPDATE USER
   */
  async updateUser(id: number, data: NewUser): Promise<ApiResponse> {
    try {
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, id),
      });
      if (user === undefined) {
        return {
          status: 404,
          msg: `User with id ${id} not found`,
        };
      }

      const updateUser = await this.db
        .update(users)
        .set(data)
        .where(eq(users.id, id));
      return {
        status: 200,
        data: updateUser,
      };
    } catch (error) {
      return {
        status: 500,
        msg: error as Error,
      };
    }
  }

  /**
   * DELETE USER
   */
  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, id),
      });
      if (user === undefined) {
        return {
          msg: `User with id ${id} not found`,
          status: 404,
        };
      }

      await this.db.delete(users).where(eq(users.id, id));
      return {
        status: 404,
        msg: `Delete user with id ${id} successfully`,
      };
    } catch (error) {
      return {
        msg: error as Error,
        status: 500,
      };
    }
  }
}
