import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GigPackageCard({
  package: pkg,
  packageType,
  onSelect,
  disabled = false,
  disabledReason = null,
}) {
  const packageTitles = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium"
  };

  const packageColors = {
    basic: "border-slate-600",
    standard: "border-blue-500 bg-blue-50/5",
    premium: "border-purple-500 bg-purple-50/5"
  };

  const getButtonVariant = () => {
    return disabled ? "outline" : "outline";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`relative h-full flex flex-col ${
          packageColors[packageType] || packageColors.basic
        } bg-slate-800/70 border-slate-700`}
      >
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-semibold text-white">
            {packageTitles[packageType]}
          </CardTitle>
          <div className="text-3xl font-bold text-white">
            ${pkg?.price || 0}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          <p className="text-sm text-slate-300 flex-grow">
            {pkg?.description || 'No description available'}
          </p>

          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {pkg?.delivery_time_days || 'N/A'} days delivery
            </span>
          </div>

          {/* Add features if they exist in the package */}
          {pkg?.features && pkg.features.length > 0 && (
            <div className="space-y-2">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {disabledReason ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      onClick={() => onSelect && onSelect(packageType)}
                      className={`w-full mt-auto ${disabled ? 'cursor-not-allowed' : ''} bg-white text-slate-800`}
                      variant={getButtonVariant()}
                      disabled={disabled}
                    >
                      Select Package
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm">{disabledReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={() => onSelect && onSelect(packageType)}
              className="w-full mt-auto bg-white text-slate-800"
              variant={getButtonVariant()}
              disabled={disabled}
            >
              Select Package
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}