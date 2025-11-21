'use client'

import { useRouter } from 'next/navigation'
import type { Organization } from '@/types/organization'
import clsx from 'clsx'

export interface OrganizationBreadcrumbProps {
  organizations?: Organization[]
  currentItem?: string
}

export const OrganizationBreadcrumb = ({
  organizations = [],
  currentItem,
}: OrganizationBreadcrumbProps) => {
  const router = useRouter()

  if (!organizations || organizations.length === 0) {
    return null
  }

  // 마지막 항목이 현재 조직, 그 앞이 상위 조직들
  const currentOrganization = organizations[organizations.length - 1]
  const parentOrganizations = organizations.slice(0, -1)

  return (
    <div className={clsx('breadcrumbs mb-4 text-base')}>
      <ul>
        <li>
          <a
            onClick={() => router.push('/home')}
            className={clsx('hover:text-primary cursor-pointer')}
          >
            Home
          </a>
        </li>
        {parentOrganizations.map(parentOrg => (
          <li key={parentOrg.orgId}>
            <a
              onClick={() => router.push(`/home/org?id=${parentOrg.orgId}`)}
              className={clsx('hover:text-primary cursor-pointer')}
            >
              {parentOrg.orgName}
            </a>
          </li>
        ))}
        {currentItem ? (
          <>
            <li>
              <a
                onClick={() =>
                  router.push(`/home/org?id=${currentOrganization.orgId}`)
                }
                className={clsx('hover:text-primary cursor-pointer')}
              >
                {currentOrganization.orgName}
              </a>
            </li>
            <li className={clsx('text-base-content font-semibold')}>
              {currentItem}
            </li>
          </>
        ) : (
          <li className={clsx('text-base-content font-semibold')}>
            {currentOrganization.orgName}
          </li>
        )}
      </ul>
    </div>
  )
}
