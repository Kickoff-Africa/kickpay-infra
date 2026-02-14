import { TransactionsPageClient } from "./TransactionsPageClient";

export const metadata = {
  title: "Transactions | Dashboard | KickPay",
  description: "View your NGN → China transfers",
};

export default function TransactionsPage() {
  return <TransactionsPageClient />;
}
