import prisma from "../prisma/client.js";
import { getThresholdByProductType } from "../utils/thresholds.js";

export const getLowStockAlerts = async (req, res) => {
    const { companyId } = req.params;

    try {
        const inventories = await prisma.inventory.findMany({
            where: {
                warehouse: { companyId }
            },
            include: {
                warehouse: true,
                product: {
                    include: {
                        suppliers: { include: { supplier: true } },
                        sales: {
                            where: {
                                createdAt: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                }
                            }
                        }
                    }
                }
            }
        });

        const alerts = [];

        for (const inv of inventories) {
            const salesQty = inv.product.sales.reduce(
                (sum, s) => sum + s.quantity,
                0
            );

            if (salesQty === 0) continue;

            const dailyRate = salesQty / 30;
            const threshold = getThresholdByProductType(inv.product.productType);

            if (inv.quantity < threshold) {
                const supplier = inv.product.suppliers[0]?.supplier;

                alerts.push({
                    product_id: inv.product.id,
                    product_name: inv.product.name,
                    sku: inv.product.sku,
                    warehouse_id: inv.warehouse.id,
                    warehouse_name: inv.warehouse.name,
                    current_stock: inv.quantity,
                    threshold,
                    days_until_stockout: Math.floor(inv.quantity / dailyRate),
                    supplier: supplier
                        ? {
                            id: supplier.id,
                            name: supplier.name,
                            contact_email: supplier.contactEmail
                        }
                        : null
                });
            }
        }

        res.json({ alerts, total_alerts: alerts.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
};
