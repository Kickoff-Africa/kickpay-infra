import { TransactionsPageClient } from "./TransactionsPageClient";

export const metadata = {
  title: "Transaction management | Admin | KickPay",
  description: "Manage transactions",
};

export default function AdminTransactionsPage() {
  return <TransactionsPageClient />;
}
