import prisma from "../prisma/client.js";

export const createProduct = async (req, res) => {
    const {
        name,
        sku,
        price,
        warehouse_id,
        initial_quantity = 0
    } = req.body;

    if (!name || !sku || price == null || !warehouse_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (initial_quantity < 0) {
        return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    try {
        const existingSku = await prisma.product.findUnique({ where: { sku } });
        if (existingSku) {
            return res.status(409).json({ error: "SKU already exists" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: { name, sku, price }
            });

            await tx.inventory.create({
                data: {
                    productId: product.id,
                    warehouseId: warehouse_id,
                    quantity: initial_quantity
                }
            });

            return product;
        });

        res.status(201).json({
            message: "Product created successfully",
            product_id: result.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create product" });
    }
};
