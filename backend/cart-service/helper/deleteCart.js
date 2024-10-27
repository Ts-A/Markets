import db from "../configs/PrismaClient.js";
import { status as GRPC_STATUS } from "@grpc/grpc-js";

export default async (call, callback) => {
  try {
    const { userId, cartId } = call.request;

    console.log(userId, cartId);

    // check for system role

    if (!userId) throw new Error("Required user id");

    const cart = await db.cart.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!cart) throw new Error("No cart found for the user");

    await db.cartProduct.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    await db.cart.delete({
      where: {
        userId,
      },
    });

    callback(null, { message: "cart deleted" });
  } catch (error) {
    console.log(error);
    callback({
      code: GRPC_STATUS.PERMISSION_DENIED,
      details: error.message,
    });
  }
};
