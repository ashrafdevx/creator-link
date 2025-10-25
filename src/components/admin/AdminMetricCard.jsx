import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const AdminMetricCard = React.memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  breakdown,
  className,
  isLoading = false,
  error = null
}) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground animate-pulse" />}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`${className} border-red-200 bg-red-50`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">{title}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">Failed to load</div>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}

        {trend && trendValue && (
          <div className="flex items-center mt-2">
            {getTrendIcon(trend)}
            <span className="text-sm text-muted-foreground ml-1">
              {trendValue} from last week
            </span>
          </div>
        )}

        {breakdown && (
          <div className="flex flex-wrap gap-1 mt-3">
            {Object.entries(breakdown).map(([key, val]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {formatValue(val)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AdminMetricCard.displayName = 'AdminMetricCard';

export default AdminMetricCard;