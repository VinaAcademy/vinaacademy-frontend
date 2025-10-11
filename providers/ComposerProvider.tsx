"use client";

import React from "react";

/**
 * Provider Composer Pattern
 * 
 * This component solves the "provider hell" problem by composing multiple
 * providers into a single component. The order of providers is preserved
 * from top to bottom in the providers array.
 * 
 * Each provider should be a React component type, not an element.
 * 
 * @example
 * ```tsx
 * <ComposerProvider providers={[
 *   ReactQueryProvider,
 *   AuthProvider,
 *   WebSocketProvider
 * ]}>
 *   <App />
 * </ComposerProvider>
 * ```
 */

type ProviderComponent = React.ComponentType<{ children: React.ReactNode }>;

interface ComposerProviderProps {
  providers: Array<ProviderComponent | [ProviderComponent, Record<string, any>] | null>;
  children: React.ReactNode;
}

export default function ComposerProvider({ 
  providers, 
  children 
}: ComposerProviderProps) {
  // Reduce providers array into nested structure
  // Working from right to left to maintain correct order
  return providers.reduceRight<React.ReactNode>(
    (acc, provider) => {
        if (!provider) return acc; // Skip null/undefined providers

      // Handle both plain provider components and [Provider, props] tuples
      if (Array.isArray(provider)) {
        const [Component, props] = provider;
        return <Component {...props}>{acc}</Component>;
      }
      
      const Component = provider;
      return <Component>{acc}</Component>;
    },
    children
  );
}
