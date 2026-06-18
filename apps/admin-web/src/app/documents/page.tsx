'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentCategory, createDocumentSchema } from '@mc-labor/shared';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandPageTitle } from '@/components/brand';
import { BRAND_HERO_IMAGES } from '@/lib/navigation';
import {
  PortalFilterPanel,
  PortalRecordsPanel,
  PortalSummaryStat,
  portalFieldClassName,
  portalFormFieldClassName,
  PersonCell,
  LinkCell,
  TitleCell,
  ActionCell,
} from '@/components/portal';
import { IconDocument, IconBuilding } from '@/components/dashboard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Table, Th, Td, ThActions } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api-client';

const uploadDocumentSchema = createDocumentSchema.extend({
  file: z.instanceof(File, { message: 'File is required' }),
});

type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export default function DocumentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<UploadDocumentInput>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: DocumentCategory.OTHER,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.getDocuments(),
  });

  const filtered = useMemo(() => {
    let docs = data ?? [];
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (categoryFilter) {
      docs = docs.filter((d) => d.category === categoryFilter);
    }
    return docs;
  }, [data, search, categoryFilter]);

  const stats = useMemo(() => {
    const docs = data ?? [];
    const categories = new Set(docs.map((d) => d.category));
    return { total: docs.length, categories: categories.size };
  }, [data]);

  const uploadMutation = useMutation({
    mutationFn: (values: UploadDocumentInput) =>
      api.uploadDocument({
        title: values.title,
        description: values.description,
        category: values.category,
        file: values.file,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setModalOpen(false);
      form.reset({
        title: '',
        description: '',
        category: DocumentCategory.OTHER,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  return (
    <DashboardLayout heroTitle="Documents" heroImage={BRAND_HERO_IMAGES.inner}>
      <BrandPageTitle
        title="Documents"
        description="Upload and manage company documents"
        action={<Button icon="upload" onClick={() => setModalOpen(true)}>Upload Document</Button>}
      />

      {data && data.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-2">
          <PortalSummaryStat label="Total documents" value={stats.total} icon={<IconDocument className="h-5 w-5" />} />
          <PortalSummaryStat
            label="Categories"
            value={stats.categories}
            icon={<IconBuilding className="h-5 w-5" />}
            accent="slate"
          />
        </div>
      )}

      <PortalFilterPanel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Search">
            <Input
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={portalFieldClassName}
            />
          </FormField>
          <FormField label="Category">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={portalFieldClassName}
            >
              <option value="">All categories</option>
              {Object.values(DocumentCategory).map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </PortalFilterPanel>

      {isLoading && <LoadingState />}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title={data?.length ? 'No documents match your filters' : 'No documents yet'}
          description="Upload policies, forms, and other company files."
        />
      )}
      {filtered.length > 0 && (
        <PortalRecordsPanel title="Document library" count={filtered.length} countLabel="documents">
          <Table hasActions>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Uploaded By</Th>
                <Th>File</Th>
                <ThActions />
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id}>
                  <Td>
                    <TitleCell title={doc.title} subtitle={doc.description} />
                  </Td>
                  <Td>
                    <Badge status={doc.category} className="rounded-full normal-case" />
                  </Td>
                  <Td>
                    {doc.uploadedBy?.name ? (
                      <PersonCell name={doc.uploadedBy.name} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </Td>
                  <Td>
                    <LinkCell href={doc.fileUrl} />
                  </Td>
                  <Td>
                    <ActionCell>
                      <Button
                        size="sm"
                        variant="softDanger"
                        icon="trash"
                        onClick={() => deleteMutation.mutate(doc.id)}
                      >
                        Delete
                      </Button>
                    </ActionCell>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </PortalRecordsPanel>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Document"
        subtitle="Add a file to the company document library"
        icon="upload"
        tone="success"
      >
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => uploadMutation.mutate(values))}
        >
          <FormField label="Title">
            <Input {...form.register('title')} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Description">
            <Textarea {...form.register('description')} rows={2} className={portalFormFieldClassName} />
          </FormField>
          <FormField label="Category">
            <Select {...form.register('category')} className={portalFormFieldClassName}>
              {Object.values(DocumentCategory).map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="File">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) form.setValue('file', file, { shouldValidate: true });
              }}
              className={portalFormFieldClassName}
            />
          </FormField>
          <ModalFooter>
            <Button variant="secondary" icon="cancel" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon="upload" loading={uploadMutation.isPending}>
              Upload
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
