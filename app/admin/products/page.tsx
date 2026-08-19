import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DbUnconfigured } from "@/components/admin/db-unconfigured";
import { ProductFormDialog } from "@/components/admin/marketplace/product-form-dialog";
import { AvailabilityToggle } from "@/components/admin/marketplace/availability-toggle";
import { listMyProducts, setProductAvailable } from "@/lib/actions/products";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products;
  try {
    products = await listMyProducts();
  } catch (err) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl">Products</h1>
        <DbUnconfigured detail={err instanceof Error ? err.message : undefined} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Products</h1>
          <p className="text-sm text-muted-foreground">Fabric and product listings for your storefront.</p>
        </div>
        <ProductFormDialog />
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No products yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Badge variant="outline">{p.product_no}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category_name ?? "—"}</TableCell>
                  <TableCell>{p.color ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                  <TableCell className="text-right">{p.stock_quantity}</TableCell>
                  <TableCell>
                    <AvailabilityToggle id={p.id} isAvailable={p.is_available} action={setProductAvailable} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
