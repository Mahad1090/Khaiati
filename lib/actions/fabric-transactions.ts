"use server";

import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { getCurrentBusinessId } from "@/lib/auth/business-context";
import { purchaseSchema, saleSchema } from "@/lib/validation/fabric";
import type { ActionResult } from "./customers";

async function nextPurchaseNo(client: { query: typeof query }) {
  const { rows } = await client.query<{ next: number }>(`select nextval('purchase_no_seq')::int as next`);
  return `PU-${String(rows[0].next).padStart(5, "0")}`;
}
async function nextSaleNo(client: { query: typeof query }) {
  const { rows } = await client.query<{ next: number }>(`select nextval('sale_no_seq')::int as next`);
  return `SA-${String(rows[0].next).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Purchases — Purchase Total = price_per_meter * size_meters (server-computed).
// Creates the purchase, an incoming stock movement, and (if paid on the spot)
// the first installment payment — all atomically.
// ---------------------------------------------------------------------------
export async function createPurchase(
  input: unknown
): Promise<ActionResult<{ id: string; purchase_no: string }>> {
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const {
    fabric_id,
    supplier_id,
    company_bill_number,
    price_per_meter,
    size_meters,
    color,
    sale_price,
    purchase_date,
    amount_paid,
    payment_type,
    note,
  } = parsed.data;

  const totalPrice = Math.round(price_per_meter * size_meters * 100) / 100;
  const totalSalePrice = Math.round(sale_price * size_meters * 100) / 100;

  if (amount_paid > totalPrice) {
    return { ok: false, error: "Amount paid cannot exceed the purchase total." };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const result = await withTransaction(async (client) => {
      const [fabricExists, supplierExists] = await Promise.all([
        client.query<{ id: string }>(`select id from fabrics where id = $1 and business_id = $2`, [
          fabric_id,
          businessId,
        ]),
        client.query<{ id: string }>(`select id from fabric_suppliers where id = $1 and business_id = $2`, [
          supplier_id,
          businessId,
        ]),
      ]);
      if (fabricExists.rows.length === 0) throw new Error("INVALID_FABRIC");
      if (supplierExists.rows.length === 0) throw new Error("INVALID_SUPPLIER");

      const purchaseNo = await nextPurchaseNo(client);
      const { rows } = await client.query<{ id: string; purchase_no: string }>(
        `insert into fabric_purchases
           (business_id, purchase_no, fabric_id, supplier_id, company_bill_number, price_per_meter, size_meters,
            total_price, color, sale_price, total_sale_price, purchase_date, payment_type, note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         returning id, purchase_no`,
        [
          businessId,
          purchaseNo,
          fabric_id,
          supplier_id,
          company_bill_number || null,
          price_per_meter,
          size_meters,
          totalPrice,
          color || null,
          sale_price,
          totalSalePrice,
          purchase_date,
          payment_type,
          note || null,
        ]
      );
      const purchase = rows[0];

      await client.query(
        `insert into fabric_stock_movements (fabric_id, movement_type, quantity_meters, reference_id, note)
         values ($1, 'purchase', $2, $3, $4)`,
        [fabric_id, size_meters, purchase.id, `Purchase ${purchase.purchase_no}`]
      );

      if (amount_paid > 0) {
        await client.query(
          `insert into fabric_purchase_payments (purchase_id, amount, paid_at, note)
           values ($1, $2, $3, $4)`,
          [purchase.id, amount_paid, purchase_date, "Initial payment"]
        );
      }

      return purchase;
    });

    revalidatePath("/admin/fabrics");
    revalidatePath(`/admin/fabrics/${fabric_id}`);
    revalidatePath(`/admin/suppliers/${supplier_id}`);
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_FABRIC") {
      return { ok: false, error: "Selected fabric does not exist." };
    }
    if (err instanceof Error && err.message === "INVALID_SUPPLIER") {
      return { ok: false, error: "Selected supplier does not exist." };
    }
    console.error("createPurchase failed", err);
    return { ok: false, error: "Could not record purchase. Please try again." };
  }
}

export async function addPurchasePayment(
  purchaseId: string,
  amount: number,
  note?: string
): Promise<ActionResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid payment amount." };
  }
  try {
    const businessId = await getCurrentBusinessId();
    const info = await withTransaction(async (client) => {
      const { rows } = await client.query<{ total: string; paid: string; fabric_id: string; supplier_id: string }>(
        `select p.total_price as total, p.fabric_id, p.supplier_id,
                coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0) as paid
         from fabric_purchases p where p.id = $1 and p.business_id = $2`,
        [purchaseId, businessId]
      );
      if (rows.length === 0) throw new Error("NOT_FOUND");
      const { total, paid, fabric_id, supplier_id } = rows[0];
      if (Number(paid) + amount > Number(total)) {
        throw new Error("OVERPAYMENT");
      }
      await client.query(
        `insert into fabric_purchase_payments (purchase_id, amount, note) values ($1, $2, $3)`,
        [purchaseId, amount, note || null]
      );
      return { fabric_id, supplier_id };
    });
    revalidatePath(`/admin/fabrics/${info.fabric_id}`);
    revalidatePath(`/admin/suppliers/${info.supplier_id}`);
    return { ok: true, data: undefined };
  } catch (err) {
    if (err instanceof Error && err.message === "OVERPAYMENT") {
      return { ok: false, error: "Payment would exceed the outstanding balance." };
    }
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { ok: false, error: "Purchase not found." };
    }
    console.error("addPurchasePayment failed", err);
    return { ok: false, error: "Could not record payment." };
  }
}

// ---------------------------------------------------------------------------
// Sales — Sale Total = price_per_meter * size_meters. Stock cannot go
// negative: the outgoing movement and availability check happen in the same
// transaction as the sale insert.
// ---------------------------------------------------------------------------
export async function createSale(input: unknown): Promise<ActionResult<{ id: string; sale_no: string }>> {
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { fabric_id, customer_id, color, size_meters, price_per_meter, sale_date, amount_paid, note } = parsed.data;
  const totalPrice = Math.round(price_per_meter * size_meters * 100) / 100;

  if (amount_paid > totalPrice) {
    return { ok: false, error: "Amount paid cannot exceed the sale total." };
  }

  try {
    const businessId = await getCurrentBusinessId();
    const result = await withTransaction(async (client) => {
      const fabricRows = await client.query<{ id: string }>(
        `select id from fabrics where id = $1 and business_id = $2`,
        [fabric_id, businessId]
      );
      if (fabricRows.rows.length === 0) throw new Error("INVALID_FABRIC");

      const stockRows = await client.query<{ available: string }>(
        `select coalesce(sum(quantity_meters), 0) as available from fabric_stock_movements where fabric_id = $1`,
        [fabric_id]
      );
      const available = Number(stockRows.rows[0].available);
      if (size_meters > available) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const saleNo = await nextSaleNo(client);
      const { rows } = await client.query<{ id: string; sale_no: string }>(
        `insert into fabric_sales (business_id, sale_no, fabric_id, customer_id, color, size_meters, price_per_meter, total_price, sale_date, note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         returning id, sale_no`,
        [businessId, saleNo, fabric_id, customer_id || null, color || null, size_meters, price_per_meter, totalPrice, sale_date, note || null]
      );
      const sale = rows[0];

      await client.query(
        `insert into fabric_stock_movements (fabric_id, movement_type, quantity_meters, reference_id, note)
         values ($1, 'sale', $2, $3, $4)`,
        [fabric_id, -size_meters, sale.id, `Sale ${sale.sale_no}`]
      );

      if (amount_paid > 0) {
        await client.query(
          `insert into fabric_sale_payments (sale_id, amount, paid_at, note) values ($1, $2, $3, $4)`,
          [sale.id, amount_paid, sale_date, "Initial payment"]
        );
      }

      return sale;
    });

    revalidatePath("/admin/fabrics");
    revalidatePath(`/admin/fabrics/${fabric_id}`);
    revalidatePath("/admin/inventory");
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_FABRIC") {
      return { ok: false, error: "Selected fabric does not exist." };
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
      return { ok: false, error: "Not enough fabric in stock for this sale." };
    }
    console.error("createSale failed", err);
    return { ok: false, error: "Could not record sale. Please try again." };
  }
}

export type GlobalPurchaseRow = {
  id: string;
  purchase_no: string;
  fabric_name: string;
  fabric_id: string;
  supplier_name: string;
  supplier_id: string;
  company_bill_number: string | null;
  size_meters: string;
  total_price: string;
  amount_paid: string;
  purchase_date: string;
  payment_type: string;
};

export async function getAllPurchases(term = ""): Promise<GlobalPurchaseRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (f.name ilike $2 or s.company_name ilike $2 or p.purchase_no ilike $2 or p.company_bill_number ilike $2)`;
  }
  const { rows } = await query<GlobalPurchaseRow>(
    `select p.id, p.purchase_no, f.name as fabric_name, f.id as fabric_id,
            s.company_name as supplier_name, s.id as supplier_id, p.company_bill_number,
            p.size_meters, p.total_price,
            coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0) as amount_paid,
            p.purchase_date, p.payment_type
     from fabric_purchases p
     join fabrics f on f.id = p.fabric_id
     join fabric_suppliers s on s.id = p.supplier_id
     where p.business_id = $1 ${extra}
     order by p.created_at desc
     limit 200`,
    params
  );
  return rows;
}

export type GlobalSaleRow = {
  id: string;
  sale_no: string;
  fabric_name: string;
  fabric_id: string;
  customer_name: string | null;
  size_meters: string;
  price_per_meter: string;
  total_price: string;
  amount_paid: string;
  sale_date: string;
};

export async function getAllSales(term = ""): Promise<GlobalSaleRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = `and (f.name ilike $2 or c.name ilike $2 or sa.sale_no ilike $2)`;
  }
  const { rows } = await query<GlobalSaleRow>(
    `select sa.id, sa.sale_no, f.name as fabric_name, f.id as fabric_id, c.name as customer_name,
            sa.size_meters, sa.price_per_meter, sa.total_price,
            coalesce((select sum(amount) from fabric_sale_payments where sale_id = sa.id), 0) as amount_paid,
            sa.sale_date
     from fabric_sales sa
     join fabrics f on f.id = sa.fabric_id
     left join customers c on c.id = sa.customer_id
     where sa.business_id = $1 ${extra}
     order by sa.created_at desc
     limit 200`,
    params
  );
  return rows;
}

export type OutstandingDebtRow = {
  id: string;
  purchase_no: string;
  supplier_name: string;
  supplier_id: string;
  fabric_name: string;
  company_bill_number: string | null;
  total_price: string;
  amount_paid: string;
  purchase_date: string;
};

/** Purchases with an outstanding balance — the fabric "credit / loan" register. */
export async function getOutstandingDebts(term = ""): Promise<OutstandingDebtRow[]> {
  const businessId = await getCurrentBusinessId();
  const trimmed = term.trim();
  const params: unknown[] = [businessId];
  let extra = "";
  if (trimmed) {
    params.push(`%${trimmed}%`);
    extra = ` and (s.company_name ilike $2 or p.purchase_no ilike $2 or p.company_bill_number ilike $2)`;
  }
  const { rows } = await query<OutstandingDebtRow>(
    `select p.id, p.purchase_no, s.company_name as supplier_name, s.id as supplier_id,
            f.name as fabric_name, p.company_bill_number, p.total_price,
            coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0) as amount_paid,
            p.purchase_date
     from fabric_purchases p
     join fabric_suppliers s on s.id = p.supplier_id
     join fabrics f on f.id = p.fabric_id
     where p.business_id = $1
       and p.total_price > coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0)
     ${extra}
     order by p.purchase_date asc
     limit 200`,
    params
  );
  return rows;
}

export type FabricPurchaseRow = {
  id: string;
  purchase_no: string;
  supplier_name: string;
  company_bill_number: string | null;
  price_per_meter: string;
  size_meters: string;
  total_price: string;
  amount_paid: string;
  purchase_date: string;
  payment_type: string;
};

export async function getFabricPurchases(fabricId: string): Promise<FabricPurchaseRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<FabricPurchaseRow>(
    `select p.id, p.purchase_no, s.company_name as supplier_name, p.company_bill_number,
            p.price_per_meter, p.size_meters, p.total_price,
            coalesce((select sum(amount) from fabric_purchase_payments where purchase_id = p.id), 0) as amount_paid,
            p.purchase_date, p.payment_type
     from fabric_purchases p
     join fabric_suppliers s on s.id = p.supplier_id
     where p.fabric_id = $1 and p.business_id = $2
     order by p.created_at desc`,
    [fabricId, businessId]
  );
  return rows;
}

export type FabricSaleRow = {
  id: string;
  sale_no: string;
  customer_name: string | null;
  size_meters: string;
  price_per_meter: string;
  total_price: string;
  amount_paid: string;
  sale_date: string;
};

export async function getFabricSales(fabricId: string): Promise<FabricSaleRow[]> {
  const businessId = await getCurrentBusinessId();
  const { rows } = await query<FabricSaleRow>(
    `select sa.id, sa.sale_no, c.name as customer_name, sa.size_meters, sa.price_per_meter, sa.total_price,
            coalesce((select sum(amount) from fabric_sale_payments where sale_id = sa.id), 0) as amount_paid,
            sa.sale_date
     from fabric_sales sa
     left join customers c on c.id = sa.customer_id
     where sa.fabric_id = $1 and sa.business_id = $2
     order by sa.created_at desc`,
    [fabricId, businessId]
  );
  return rows;
}
