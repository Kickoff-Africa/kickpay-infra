"use client";

export function TransactionsPageClient() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Transaction management</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        View transactions, resolve disputes, initiate refunds. Connect a Transaction model and APIs to see data here.
      </p>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Total transactions</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Successful</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">0</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Failed</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">0</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">0</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="font-semibold text-[var(--foreground)]">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 font-medium">ID</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="p-12 text-center text-[var(--muted-foreground)]">
                  No transactions yet. Add a Transaction model and payment APIs to list and manage transactions here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
