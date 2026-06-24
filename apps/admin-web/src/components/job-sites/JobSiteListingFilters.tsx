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
  salesmen?: string[];
  customerTypes?: string[];
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
  salesmen = [],
  customerTypes = [],
  showCustomerFilter = false,
}: JobSiteListingFiltersProps) {
  const update = (patch: Partial<JobSiteFilterValues>) => onChange({ ...filters, ...patch });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const selectClassName = `${formControlClassName} min-w-[11rem] flex-1`;

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

      <div className="mt-4 flex flex-wrap gap-3">
        {showCustomerFilter ? (
          <Select
            value={filters.customerId}
            onChange={(event) => update({ customerId: event.target.value })}
            className={selectClassName}
            aria-label="Customer"
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </Select>
        ) : null}

        {salesmen.length > 0 ? (
          <Select
            value={filters.salesman}
            onChange={(event) => update({ salesman: event.target.value })}
            className={selectClassName}
            aria-label="Salesman"
          >
            <option value="">All salesmen</option>
            {salesmen.map((salesman) => (
              <option key={salesman} value={salesman}>
                {salesman}
              </option>
            ))}
          </Select>
        ) : null}

        {customerTypes.length > 0 ? (
          <Select
            value={filters.customerType}
            onChange={(event) => update({ customerType: event.target.value })}
            className={selectClassName}
            aria-label="Customer type"
          >
            <option value="">All customer types</option>
            {customerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        ) : null}

        <Select
          value={filters.status}
          onChange={(event) => update({ status: event.target.value })}
          className={selectClassName}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>

        <Select
          value={filters.location}
          onChange={(event) => update({ location: event.target.value })}
          className={selectClassName}
          aria-label="Location"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Select>

        <Button type="submit" className="h-[42px] shrink-0 px-6" aria-label="Search job sites">
          <SearchIcon className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
