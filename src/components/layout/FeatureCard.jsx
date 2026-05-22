import React from "react";
import { features } from "../../utils/features";

export default function FeatureCard() {
  return (
    <div className="relative z-10 py-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Transforming Campus Operations
        </h2>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
          A modern, unified academic platform engineered for daily ease-of-use and administrative efficiency.
        </p>
      </div>

      {/* Grid Layout of Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group flex gap-4 p-6 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Icon Container */}
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-200">
                <Icon className="w-6 h-6" />
              </div>

              {/* Text Container */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}