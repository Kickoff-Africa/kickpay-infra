import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Analytics | Admin | KickPay",
  description: "API usage analytics",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Analytics</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        API usage, request volume, and performance metrics. This section will show charts and data once tracking is implemented.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Placeholder: Integrate with your API gateway or logging to display request counts per endpoint, per user, error rates, and latency. You can add a model for API call events or use an external analytics provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
