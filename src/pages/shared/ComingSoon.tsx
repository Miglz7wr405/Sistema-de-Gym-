import { PageHeader } from '@/components/AppShell'
import { EmptyState } from '@/components/ui'

export default function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon="🚧" text="Esta área chega numa próxima fase." />
    </>
  )
}
