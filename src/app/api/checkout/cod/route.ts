import { prisma } from "@/lib/db";

type CodItem = {
  productId: string;
  name: string;
  qty: number;
};

type CodBody = {
  customer: {
    name: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CodItem[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CodBody;

    if (!body.items || body.items.length === 0) {
      return Response.json({ error: "Cart is empty." }, { status: 400 });
    }

    const { name, email, street, city, state, zip } = body.customer ?? {};
    if (
      ![name, email, street, city, state, zip].every(
        (v) => typeof v === "string" && v.trim().length > 0
      )
    ) {
      return Response.json(
        { error: "Name, email and a full shipping address are required." },
        { status: 400 }
      );
    }

    // Re-validate against the database — never trust client prices or stock.
    const ids = [...new Set(body.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    let totalUsd = 0;
    for (const item of body.items) {
      const product = byId.get(item.productId);
      if (!product) {
        return Response.json(
          { error: `"${item.name}" is no longer available.` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(item.qty));
      if (qty > product.stock) {
        return Response.json(
          {
            error: `Only ${product.stock} units of "${product.name}" are in stock.`,
          },
          { status: 400 }
        );
      }
      totalUsd += product.priceUsd.toNumber() * qty;
    }

    const order = await prisma.order.create({
      data: {
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        },
        items: body.items.map((i) => ({
          productId: i.productId,
          name: byId.get(i.productId)?.name ?? i.name,
          priceUsd: byId.get(i.productId)?.priceUsd.toNumber() ?? 0,
          image: byId.get(i.productId)?.images[0] ?? "",
          qty: Math.max(1, Math.floor(i.qty)),
        })),
        totalUsd,
        status: "placed",
        paymentMethod: "cod",
      },
    });

    for (const item of body.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: Math.max(1, Math.floor(item.qty)) } },
      });
    }

    return Response.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("checkout/cod:", err);
    return Response.json({ error: "Could not place the order." }, { status: 500 });
  }
}
