import db from "../configs/PrismaClient.js";
import { status as GRPC_STATUS } from "@grpc/grpc-js";
import { authUser } from "../helper/index.js";

const ALLOWED_ROLES = ["admin", "system"];

export default async (call, callback) => {
  try {
    const { id } = call.request;

    await authUser(
      call.metadata.get("authorization")
        ? call.metadata.get("authorization")[0]
        : "",
      ALLOWED_ROLES
    );

    if (!id) throw new Error("Product id required.");

    const product = await db.product.delete({
      where: {
        id,
      },
    });

    if (!product) throw new Error("Product not found");

    callback(null, product);
  } catch (error) {
    callback({ code: GRPC_STATUS.NOT_FOUND, details: error.message });
  }
};
