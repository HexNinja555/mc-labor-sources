'use client';

import { FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formControlClassName } from '@/components/ui/formStyles';
import type { JobSiteFilterValues } from '@/lib/job-site-utils';

interface JobSiteListingFiltersProps {
  filters: JobSiteFilterValues;
  onChange: (next: JobSiteFilterValues) => void;
  locations: string[];
  customers?: { id: string; companyName: string }[];
  showCustomerFilter?: boolean;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function JobSiteListingFilters({
  filters,
  onChange,
  locations,
  customers = [],
  showCustomerFilter = false,
}: JobSiteListingFiltersProps) {
  const update = (patch: Partial<JobSiteFilterValues>) => onChange({ ...filters, ...patch });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6"
    >
      <Input
        placeholder="Keywords"
        value={filters.keywords}
        onChange={(event) => update({ keywords: event.target.value })}
        className={formControlClassName}
      />

      <div
        className={`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 ${showCustomerFilter ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}
      >
        {showCustomerFilter && (
          <Select
            value={filters.customerId}
            onChange={(event) => update({ customerId: event.target.value })}
            className={formControlClassName}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </Select>
        )}

        <Select
          value={filters.status}
          onChange={(event) => update({ status: event.target.value })}
          className={formControlClassName}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>

        <Select
          value={filters.location}
          onChange={(event) => update({ location: event.target.value })}
          className={formControlClassName}
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Select>

        <Button
          type="submit"
          className="h-[42px] w-full"
          aria-label="Search job sites"
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
